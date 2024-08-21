// 'use client'

// import React, { useState } from 'react'


// // **MUI icons
// import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
// import AddIcon from '@mui/icons-material/Add';


// // **MUI Components
// import { Box, Container, Chip, Button, Stack } from '@mui/material';


// // ** Custom Components
// import CreateTemplateModal from "@components/template/CreateTemplateModal"

// // ** Table
// import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid"
// interface TemplateTable {
//     id: number; 
//     templateName: string,
//     category: string,
//     status: string,
//     language: string,
//     lastUpdated: string,

// }


// const getStatusColor = (status: string) => {
//     switch (status) {
//         case 'Approved':
//             return 'success'; 
//         case 'Pending':
//             return 'warning'; 
//         case 'Rejected':
//             return 'error'; 
//         default:
//             return 'default'; 
//     }
// };

// const TemplateTable = () => {

// const [open, setOpen] = useState<boolean>(false)
//     const rows: TemplateTable[] = [
//         {
//             id: 1,
//             templateName: 'Welcome Message',
//             category: 'Greeting',
//             status: 'Approved',
//             language: 'English',
//             lastUpdated: '2024-08-01',
//         },
//         {
//             id: 2,
//             templateName: 'Order Confirmation',
//             category: 'Transaction',
//             status: 'Pending',
//             language: 'Spanish',
//             lastUpdated: '2024-08-02',
//         },
//         {
//             id: 3,
//             templateName: 'Shipping Update',
//             category: 'Notification',
//             status: 'Approved',
//             language: 'French',
//             lastUpdated: '2024-08-03',
//         },
//         {
//             id: 4,
//             templateName: 'Appointment Reminder',
//             category: 'Reminder',
//             status: 'Rejected',
//             language: 'German',
//             lastUpdated: '2024-08-04',
//         },
//         {
//             id: 5,
//             templateName: 'Feedback Request',
//             category: 'Survey',
//             status: 'Approved',
//             language: 'Italian',
//             lastUpdated: '2024-08-05',
//         }
//     ];

//     const cols: GridColDef[] = [
//         { field: 'templateName', headerName: 'Template Name', flex: 1, minWidth: 150 },
//         { field: 'category', headerName: 'Category', flex: 1, minWidth: 150 },
//         {
//             field: 'status', headerName: 'Status', flex: 1, minWidth: 150,
//             renderCell: (params: GridRenderCellParams) => (
//                 <Chip
//                     label={params.value}
//                     color={getStatusColor(params.value as string)}
//                     variant="outlined"
//                 />
//             ),
//         },
//         { field: 'language', headerName: 'Language', flex: 1, minWidth: 150 },
//         { field: 'lastUpdated', headerName: 'Last Updated', flex: 1, minWidth: 150 },
//         {
//             field: 'actions', headerName: 'Actions', flex: 1, minWidth: 150,
//             renderCell: (params: GridRenderCellParams) => {
//                 return (
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                         <VisibilitySharpIcon />
//                         <ContentCopyIcon />
//                         <DeleteForeverIcon />
//                     </Box>
//                 );
//             }
//         },
//     ];

//     return (
//         <Container sx={{
//             padding: '1.4rem',
//         }}>
//             <CreateTemplateModal isOpen={open} onClose={() => setOpen((prev) => !prev)}/>
//             <Box sx={{
//                 display: 'flex',
//                 justifyContent: 'flex-end',
//                 marginBottom: '1.4rem',
//             }}>           
//             <Button variant="contained" color="primary" startIcon={<AddIcon/>} onClick = {() => setOpen((prev) => !prev)}>
//                 Add Template
//             </Button>
//             </Box>

        
//             <Box sx={{ height: 400, width: '100',}}>
//                 <DataGrid rows={rows} columns={cols}  slots={{ toolbar: GridToolbar}}  />
//             </Box>
//         </Container>
//     );
// }

// export default TemplateTable;
