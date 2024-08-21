'use client'
import { Companies } from '@firebase/config'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { describeIndexStats } from '@pinecone-database/pinecone/dist/data/describeIndexStats'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { OpenAI } from 'openai'
import type {
  ChatCompletion,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions'
import { toast } from 'react-toastify'

export const fetchDocFromPinecone = async (id: string) => {
  console.log('id', id)
  try {
    const queryEmbedding = new OpenAIEmbeddings({
      apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY as string,
    })
    const queryEmbeddingVectorSummary =
      await queryEmbedding.embedQuery('summary')
    const queryEmbeddingVectorServices =
      await queryEmbedding.embedQuery('services')
    const queryEmbeddingVectorFaqs = await queryEmbedding.embedQuery('faqs')

    const pinecone = new Pinecone({
      apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY as string,
    })

    const index = pinecone.Index('polarai')

    const indexStats = await index.describeIndexStats()

    console.log(indexStats.totalRecordCount)

    if (!indexStats.totalRecordCount) {
      toast.error('Upload some documents before fetching details')

      return
    }
    const queryRequestSummary = {
      vector: queryEmbeddingVectorSummary,
      topK: indexStats.totalRecordCount || 0,
      includeValues: true,
      includeMetadata: true,
    }
    const queryRequestServices = {
      vector: queryEmbeddingVectorServices,
      topK: indexStats.totalRecordCount || 0,
      includeValues: true,
      includeMetadata: true,
    }
    const queryRequestFaqs = {
      vector: queryEmbeddingVectorFaqs,
      topK: indexStats.totalRecordCount || 0,
      includeValues: true,
      includeMetadata: true,
    }

    const summaryResult = await index.namespace(id).query(queryRequestSummary)
    const servicesResult = await index.namespace(id).query(queryRequestServices)
    const faqsResult = await index.namespace(id).query(queryRequestFaqs)

    if (
      summaryResult.matches.length === 0 ||
      servicesResult.matches.length === 0 ||
      faqsResult.matches.length === 0
    ) {
      console.log('I was here')
      return false
    }

    const docContextSummary: ChatCompletionMessageParam = {
      role: 'user',
      content: 'use this context for generating summary: ',
    }

    const docContextServices: ChatCompletionMessageParam = {
      role: 'user',
      content:
        "Generate bullet points for Products & Services offered based on the provided context dont't go out of context:",
    }

    const docContextFaqs: ChatCompletionMessageParam = {
      role: 'user',
      content: 'Extract and generate 10 faqs from the given context: ',
    }

    summaryResult.matches.map((match) => {
      if (match.metadata) {
        docContextSummary.content += `${match.metadata.text} `
      }
    })

    servicesResult.matches.map((match) => {
      if (match.metadata) {
        docContextServices.content += `${match.metadata.text} `
      }
    })

    faqsResult.matches.map((match) => {
      if (match.metadata) {
        docContextFaqs.content += `${match.metadata.text} `
      }
    })

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY as string,
      dangerouslyAllowBrowser: true,
    })

    const contextSummary: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'Chatbot that summarizes given context',
      },

      docContextSummary,
      { role: 'user', content: 'Summarize the context' },
    ]

    const contextServices: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'Chatbot that generates bullet points for Products & Services offered',
      },

      docContextServices,
      {
        role: 'user',
        content: 'Generate bullet points for Products & Services offered',
      },
    ]

    const contextFaqs: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `based on the given information create a 10 FAQs and return them in a json array with each object in the following format
{
Question: ......,
Ans:....
}`,
      },

      docContextFaqs,
      {
        role: 'user',
        content: `based on the given information create a 10 FAQs and return them in a json array with each object in the following format
{
Question: ......,
Ans:....
}
`,
      },
    ]

    let responseSummary: ChatCompletion
    try {
      responseSummary = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [...contextSummary],
      })
    } catch {
      toast.error(
        'Too many files uploaded.Please remove some files and try again.',
      )
      return
    }
    console.log('ressum', responseSummary)

    let responseServices: ChatCompletion
    try {
      responseServices = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [...contextServices],
        temperature: 0.5,
      })
    } catch {
      toast.error(
        'Too many files uploaded.Please remove some files and try again.',
      )
      return
    }
    let responseFaqs: ChatCompletion
    try {
      responseFaqs = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [...contextFaqs],
        response_format: { type: 'json_object' },
      })
    } catch {
      toast.error(
        'Too many files uploaded.Please remove some files and try again.',
      )
      return
    }

    const aiResponseSummary = responseSummary.choices[0].message.content
    const aiResponseServices = responseServices.choices[0].message.content
    const aiResponseFaqs = JSON.parse(
      responseFaqs.choices[0].message.content || '',
    )
    console.log(
      '#',
      aiResponseSummary,
      '##',
      aiResponseServices,
      aiResponseFaqs,
    )

    const companyRef = doc(Companies, id)
    const companySnap = await getDoc(companyRef)
    const company = companySnap.data()

    if (company) {
      const updatedCompany = {
        ...company,
        botInfo: {
          ...company.botInfo,
          summary: aiResponseSummary,
          services: aiResponseServices,
          faqs: aiResponseFaqs.faqs,
        },
      }
      await updateDoc(companyRef, updatedCompany)
      console.log('Info updated successfully')
      return true
    }
    console.log('Company not found')
    return false
  } catch (error) {
    console.error(error)
    throw new Error('Error while fetching doc from Pinecone')
  }
}
