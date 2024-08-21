import { google } from 'googleapis'
import fetch from 'node-fetch'

const drive = google.drive('v3')

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')
  const fileId = searchParams.get('fileId')

  try {
    const base64Key = `${process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_KEY}`;
    const jsonString = Buffer.from(base64Key, 'base64').toString('utf-8');
    const key = JSON.parse(jsonString);
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })

    const authClient = await auth.getClient()

    if (folderId) {
      const driveResponse = await drive.files.list({
        auth: authClient,
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, mimeType)',
      })

      return new Response(JSON.stringify(driveResponse.data.files), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (fileId) {
      const fileMetadata = await drive.files.get({
        auth: authClient,
        fileId: fileId,
        fields: 'id, name, mimeType',
      })

      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
      const accessToken = await authClient.getAccessToken()

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      })

      if (!response.ok) {
        console.error(
          'Error fetching file from Google Drive:',
          response.statusText,
        )
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch file',
            details: response.statusText,
          }),
          {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }

      const buffer = await response.buffer()
      const contentType = response.headers.get('content-type')

      return new Response(
        JSON.stringify({
          fileContent: buffer.toString('base64'),
          fileName: fileMetadata.data.name,
          contentType: contentType,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
    return new Response(
      JSON.stringify({ error: 'No folderId or fileId provided' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in API route:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
