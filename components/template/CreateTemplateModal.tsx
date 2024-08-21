// import React, { useState, ChangeEvent } from 'react'
// import {IconButton, Container, Modal, Typography, Stack, Box, TextField, Select, MenuItem, FormControl, InputLabel, Divider, Button, SelectChangeEvent } from '@mui/material'
// import { useDropzone, DropzoneOptions } from 'react-dropzone'
// import DeleteIcon from '@mui/icons-material/Delete'


// import dynamic from 'next/dynamic';

// const ReactQuill = dynamic(
//   () => {
//     return import('react-quill');
//   },
//   { ssr: false }
// );

// import 'react-quill/dist/quill.snow.css'

// interface CreateTemplateModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface FormData {
//   templateName: string;
//   category: string;
//   language: string;
//   uploadType: 'none' | 'text' | 'media';
//   titleText: string;
//   mediaType: string;
//   richTextContent: string;
//   footer: string;
//   buttons: string[];
// }

// const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose }) => {
//   const [formData, setFormData] = useState<FormData>({
//     templateName: '',
//     category: '',
//     language: '',
//     uploadType: 'none',
//     titleText: '',
//     mediaType: '',
//     richTextContent: '',
//     footer: '',
//     buttons: ['']
//   })

//   const variable = '{{name}}'

//   const onDrop = (acceptedFiles: File[]) => {
//     // Handle file upload logic here
//     console.log(acceptedFiles)
//   }

//   const dropzoneOptions: DropzoneOptions = { onDrop }
//   const { getRootProps, getInputProps } = useDropzone(dropzoneOptions)

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: value
//     }))
//   }

//   const handleSelectChange = (e: SelectChangeEvent<string>) => {
//     const { name, value } = e.target
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: value
//     }))
//   }

//   const handleRichTextChange = (content: string) => {
//     setFormData(prevData => ({
//       ...prevData,
//       richTextContent: content
//     }))
//   }

//   const handleAddButton = () => {
//     setFormData(prevData => ({
//       ...prevData,
//       buttons: [...prevData.buttons, '']
//     }))
//   }

//   const handleButtonTextChange = (index: number, value: string) => {
//     setFormData(prevData => {
//       const newButtons = [...prevData.buttons]
//       newButtons[index] = value
//       return { ...prevData, buttons: newButtons }
//     })
//   }

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     console.log('Form submitted:', formData)
//     // Here you would typically send the data to your backend or perform other actions
//     onClose()
//   }

//   const handleRemoveButton = (index: number) => {
//     setFormData(prevData => {
//       const newButtons = prevData.buttons.filter((_, i) => i !== index)
//       return { ...prevData, buttons: newButtons }
//     })
//   }

//   const modules = {
//     toolbar: [
//       ['bold', 'italic'],
//       ['emoji'],
//     ],
//   }

//   const formats = ['bold', 'italic', 'emoji']

//   return (
//     <Modal open={isOpen} onClose={onClose}>
//       <Container sx={{
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: "60vw",
//         height: "80vh",
//         bgcolor: "background.paper",
//         boxShadow: 24,
//         overflow: "auto",
//         p: 4,
//       }}>
//         <form onSubmit={handleSubmit}>
//           <Stack sx={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}>
//             <Typography variant='h6'>Create Template</Typography>
//           </Stack>
//           <Box sx={{
//             marginTop: '0.5rem',
//             display: 'flex',
//             flexDirection: 'row',
//             gap: '1rem'
//           }}>
//             <TextField 
//               label="Template Name"
//               name="templateName"
//               value={formData.templateName}
//               onChange={handleInputChange}
//             />
//             <FormControl>
//               <InputLabel>Category</InputLabel>
//               <Select 
//                 sx={{ width: '15rem' }} 
//                 label="Category"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleSelectChange}
//               >
//                 <MenuItem value="marketing">Marketing</MenuItem>
//                 <MenuItem value="utility">Utility</MenuItem>
//               </Select>
//             </FormControl>
//             <FormControl>
//               <InputLabel>Language</InputLabel>
//               <Select 
//                 sx={{ width: '15rem' }} 
//                 label="Language"
//                 name="language"
//                 value={formData.language}
//                 onChange={handleSelectChange}
//               >
//                 <MenuItem value="english">English</MenuItem>
//                 <MenuItem value="spanish">Spanish</MenuItem>
//                 <MenuItem value="french">French</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//           <Divider />
//           <Box mt={2}>
//             <Typography variant='h6'>Broadcast title (Optional)</Typography>
//             <Typography component={'p'}>Highlight your brand here, use images or videos, to stand out</Typography>
//             <FormControl sx={{
//               marginTop: '1rem'
//             }}>
//               <InputLabel>Upload</InputLabel>
//               <Select
//                 value={formData.uploadType}
//                 onChange={handleSelectChange}
//                 name="uploadType"
//                 label="Upload"
//                 sx={{ width: '15rem' }}
//               >
//                 <MenuItem value="none">None</MenuItem>
//                 <MenuItem value="text">Text</MenuItem>
//                 <MenuItem value="media">Media</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
          
//           {formData.uploadType === 'text' && (
//             <TextField
//               label="Title Text"
//               name="titleText"
//               value={formData.titleText}
//               onChange={handleInputChange}
//               helperText={`${formData.titleText.length}/60 characters`}
//               fullWidth
//               margin="normal"
//             />
//           )}
          
//           {formData.uploadType === 'media' && (
//             <Box>
//               <FormControl fullWidth margin="normal">
//                 <InputLabel>Media Type</InputLabel>
//                 <Select
//                   value={formData.mediaType}
//                   onChange={handleSelectChange}
//                   name="mediaType"
//                   label="Media Type"
//                 >
//                   <MenuItem value="document">Document</MenuItem>
//                   <MenuItem value="image">Image</MenuItem>
//                   <MenuItem value="video">Video</MenuItem>
//                 </Select>
//               </FormControl>
              
//               {formData.mediaType && (
//                 <Box {...getRootProps()} sx={{ border: '2px dashed gray', p: 2, mt: 2 }}>
//                   <input {...getInputProps()} />
//                   <Typography>Drag and drop a {formData.mediaType} here, or click to select one</Typography>
//                 </Box>
//               )}
//             </Box>
//           )}

//           <Box mt={2}>
//             <Typography variant='h6'>Body</Typography>
//             <Typography component={'p'}>Make your messages personal using variables like {variable} and get more replies!</Typography>
//             <ReactQuill 
//               theme="snow"
//               value={formData.richTextContent}
//               onChange={handleRichTextChange}
//               modules={modules}
//               formats={formats}
//             />
//           </Box>


// <Box mt={2}>
// <Typography variant='h6'>Footer (Optional)</Typography>
// <Typography component={'p'}>Footers are great to add any disclaimers or to add a thoughtful PS</Typography>
// <TextField
//             label="Footer"
//             name="footer"
//             value={formData.footer}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />


// </Box>

//           <Box mt={2}>
//             <Typography variant='h6'>Buttons (Optional)</Typography>
//             <Typography component={'p'}>
// Create up to 3 buttons that let customers respond to your message or take action.</Typography>
//             {formData.buttons.map((button, index) => (
//               <Box key={index} display="flex" alignItems="center" mb={1}>
//                 <TextField
//                   label={`Button ${index + 1}`}
//                   value={button}
//                   onChange={(e) => handleButtonTextChange(index, e.target.value)}
//                   fullWidth
//                   margin="normal"
//                 />
//                 <IconButton 
//                   onClick={() => handleRemoveButton(index)} 
//                   sx={{ ml: 1 }}
//                   disabled={formData.buttons.length === 1}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </Box>
//             ))}
//             <Button onClick={handleAddButton} variant="outlined" sx={{ mt: 1 }}>
//               Add Button
//             </Button>
//           </Box>

//           <Box mt={2}>
//             <Button type="submit" variant="contained" color="primary">
//               Create Template
//             </Button>
//           </Box>
//         </form>
//       </Container>
//     </Modal>
//   )
// }

// export default CreateTemplateModal

import React, { useState, ChangeEvent } from 'react'
import {
  IconButton, Container, Modal, Typography, Stack, Box, TextField, Select, MenuItem, 
  FormControl, InputLabel, Divider, Button, SelectChangeEvent
} from '@mui/material'
import { useDropzone, DropzoneOptions } from 'react-dropzone'
import DeleteIcon from '@mui/icons-material/Delete'

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  templateName: string;
  category: string;
  language: string;
  components: any[];
  uploadType: string;
  mediaType: string;
  titleText: string;
  bodyText: string;
  footer: string;
  buttons: string[];
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    templateName: '',
    category: '',
    language: '',
    components: [],
    uploadType: '',
    mediaType: '',
    titleText: '',
    bodyText: '',
    footer: '',
    buttons: ['']
  })

  const variable = '{{1}}'

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        updateComponents('HEADER', {
          type: "HEADER",
          format: "DOCUMENT",
          example: {
            header_handle: [base64String]
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  const dropzoneOptions: DropzoneOptions = { onDrop }
  const { getRootProps, getInputProps } = useDropzone(dropzoneOptions)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleBodyTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData(prevData => ({
      ...prevData,
      bodyText: value
    }))
    updateComponents('BODY', {
      type: "BODY",
      text: value,
      example: {
        body_text: [["Name"]]
      }
    })
  }

  const handleAddButton = () => {
    setFormData(prevData => ({
      ...prevData,
      buttons: [...prevData.buttons, '']
    }))
    updateButtonsComponent()
  }

  const handleButtonTextChange = (index: number, value: string) => {
    setFormData(prevData => {
      const newButtons = [...prevData.buttons]
      newButtons[index] = value
      return { 
        ...prevData, 
        buttons: newButtons
      }
    })
    updateButtonsComponent()
  }

  const handleRemoveButton = (index: number) => {
    setFormData(prevData => {
      const newButtons = prevData.buttons.filter((_, i) => i !== index)
      return { ...prevData, buttons: newButtons }
    })
    updateButtonsComponent()
  }

  const updateComponents = (type: string, newComponent: any) => {
    setFormData(prevData => {
      const updatedComponents = prevData.components.filter(comp => comp.type !== type)
      return {
        ...prevData,
        components: [...updatedComponents, newComponent]
      }
    })
  }

  const updateButtonsComponent = () => {
    setFormData(prevData => {
      const buttonsComponent = {
        type: "BUTTONS",
        buttons: prevData.buttons.filter(b => b).map(text => ({
          type: "CATALOG",
          text
        }))
      }
      const updatedComponents = prevData.components.filter(comp => comp.type !== "BUTTONS")
      return {
        ...prevData,
        components: [...updatedComponents, buttonsComponent]
      }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Container sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60vw",
        height: "80vh",
        bgcolor: "background.paper",
        boxShadow: 24,
        overflow: "auto",
        p: 4,
      }}>
        <form onSubmit={handleSubmit}>
          <Stack sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Typography variant='h6'>Create Template</Typography>
          </Stack>
          <Box sx={{
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem'
          }}>
            <TextField 
              label="Template Name"
              name="templateName"
              value={formData.templateName}
              onChange={handleInputChange}
            />
            <FormControl>
              <InputLabel>Category</InputLabel>
              <Select 
                sx={{ width: '15rem' }} 
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleSelectChange}
              >
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="utility">Utility</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Language</InputLabel>
              <Select 
                sx={{ width: '15rem' }} 
                label="Language"
                name="language"
                value={formData.language}
                onChange={handleSelectChange}
              >
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="spanish">Spanish</MenuItem>
                <MenuItem value="french">French</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Divider />
          <Box mt={2}>
            <Typography variant='h6'>Broadcast title (Optional)</Typography>
            <Typography component={'p'}>Highlight your brand here, use images or videos, to stand out</Typography>
            <FormControl sx={{
              marginTop: '1rem'
            }}>
              <InputLabel>Upload</InputLabel>
              <Select
                value={formData.uploadType}
                onChange={handleSelectChange}
                name="uploadType"
                label="Upload"
                sx={{ width: '15rem' }}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="media">Media</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {formData.uploadType === 'text' && (
            <TextField
              label="Title Text"
              name="titleText"
              value={formData.titleText}
              onChange={handleInputChange}
              helperText={`${formData.titleText.length}/60 characters`}
              fullWidth
              margin="normal"
            />
          )}
          
          {formData.uploadType === 'media' && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Media Type</InputLabel>
                <Select
                  value={formData.mediaType}
                  onChange={handleSelectChange}
                  name="mediaType"
                  label="Media Type"
                >
                  <MenuItem value="document">Document</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                </Select>
              </FormControl>
              
              {formData.mediaType && (
                <Box {...getRootProps()} sx={{ border: '2px dashed gray', p: 2, mt: 2 }}>
                  <input {...getInputProps()} />
                  <Typography>Drag and drop a {formData.mediaType} here, or click to select one</Typography>
                </Box>
              )}
            </Box>
          )}

          <Box mt={2}>
            <Typography variant='h6'>Body</Typography>
            <Typography component={'p'}>Make your messages personal using variables like {variable} and get more replies!</Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={formData.bodyText}
              onChange={handleBodyTextChange}
              placeholder="Enter your message here..."
            />
          </Box>

          <Box mt={2}>
            <Typography variant='h6'>Footer (Optional)</Typography>
            <Typography component={'p'}>Footers are great to add any disclaimers or to add a thoughtful PS</Typography>
            <TextField
              label="Footer"
              name="footer"
              value={formData.footer}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box mt={2}>
            <Typography variant='h6'>Buttons (Optional)</Typography>
            <Typography component={'p'}>
              Create up to 3 buttons that let customers respond to your message or take action.
            </Typography>
            {formData.buttons.map((button, index) => (
              <Box key={index} display="flex" alignItems="center" mb={1}>
                <TextField
                  label={`Button ${index + 1}`}
                  value={button}
                  onChange={(e) => handleButtonTextChange(index, e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <IconButton 
                  onClick={() => handleRemoveButton(index)} 
                  sx={{ ml: 1 }}
                  disabled={formData.buttons.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddButton} variant="outlined" sx={{ mt: 1 }}>
              Add Button
            </Button>
          </Box>

          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Create Template
            </Button>
          </Box>
        </form>
      </Container>
    </Modal>
  )
}

export default CreateTemplateModal