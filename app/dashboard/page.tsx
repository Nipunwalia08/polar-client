'use client'
import CampaignTable from '@components/campaign/manage/CampaignTable'
import FilterCampaign from '@components/campaign/manage/FilterCampaign'
import { db } from '@firebase/config'
import { ChevronRight } from '@mui/icons-material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import NotificationsIcon from '@mui/icons-material/Notifications'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material'
import useCampaignStore, { refetchCampaigns } from '@store/useCampaignStore'
import usePersistStore from '@store/usePersistStore'
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
)

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false, // Disable the default legend
    },
    title: {
      display: true,
      text: 'Profile Statistics',
    },
  },
}

const doughnutData = {
  labels: [
    'Connection Requests Sent',
    'Connection Requests Sent by email',
    'Message Sent',
    'Email Sent',
  ],
  datasets: [
    {
      data: [1, 10, 15, 10],
      backgroundColor: ['#9c27b0', '#3f51b5', '#ff9800', '#03a9f4'],
      hoverBackgroundColor: ['#ce93d8', '#7986cb', '#ffcc80', '#81d4fa'],
    },
  ],
}

export default function DashboardPage() {
  const { campaigns } = useCampaignStore();
  const { adminId } = usePersistStore();
  const [name, setName] = useState('');
  const [activeChats, setActiveChats] = useState(0);

  useEffect(() => {
    const fetchNameAndChats = async () => {
      if (!adminId) return;

      // Fetch name from Admin or Customers collection
      const adminDoc = await getDoc(doc(db, 'Admins', adminId));
      if (adminDoc.exists()) {
        setName(adminDoc.data().name);
      } else {
        const customerDoc = await getDoc(doc(db, 'Customers', adminId));
        if (customerDoc.exists()) {
          setName(customerDoc.data().name);
        }
      }

      // Fetch active chats based on companyId
      const whatsappMessagesCollection = collection(db, 'WhatsappMessages');
      const q = query(whatsappMessagesCollection, where('adminId', '==', adminId));
      const querySnapshot = await getDocs(q);
      setActiveChats(querySnapshot.size);
    };

    fetchNameAndChats();
    refetchCampaigns();
  }, [adminId]);

  return (
    <>
      <Stack sx={{ flexGrow: 1, m: 4 }}>
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stack>
            <Typography variant="h4" sx={{ fontWeight: '500' }}>
              Good evening,{name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Here&apos;s what&apos;s happening with your WhatsApp
              account today
            </Typography>
          </Stack>
          {/* <Stack sx={{ flexDirection: 'row', height: '40px' }}>
            <Button
              startIcon={<LinkedInIcon />}
              variant="contained"
              color="primary"
              sx={{
                mr: 2,
                borderRadius: '5px',
                background:
                  'var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
              }}
            >
              LinkedIn
            </Button>
            <Button
              startIcon={<WhatsAppIcon />}
              variant="contained"
              color="primary"
            >
              WhatsApp
            </Button>
          </Stack> */}
        </Stack>

        <Stack spacing={2} sx={{ mt: 2, flexDirection: 'row', gap: '20px' }}>
          <Stack sx={{ width: '65%' }}>
            <Paper sx={{ p: 2 }}>
              <Stack
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: '50px',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight="500" fontSize="28px">
                    Statistics
                  </Typography>
                  <Link href="#">
                    <Typography
                      color="#211AEB"
                      className="flex flex-row items-center"
                    >
                      View More <ChevronRightIcon sx={{ color: '#211AEB' }} />
                    </Typography>
                  </Link>
                </Stack>
                <Button
                  variant="outlined"
                  sx={{ color: '#211AEB', borderColor: '#211AEB' }}
                >
                  Manage Limits
                </Button>
              </Stack>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '30px',
                  marginBottom: '15px',
                }}
              >
                <div style={{ width: '300px', height: '300px' }}>
                  <Doughnut data={doughnutData} options={options} />
                </div>
                <div style={{ marginLeft: '40px' }}>
                  {doughnutData.labels.map((label, index) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: doughnutData.datasets[0].backgroundColor[index],
                          marginRight: '8px',
                        }}
                      />
                      <Typography variant="body1" style={{ marginRight: '8px' }}>
                        {label}
                      </Typography>
                      <Typography variant="body1">
                        {doughnutData.datasets[0].data[index]}/20
                      </Typography>
                    </div>
                  ))}
                </div>
                </div>
            </Paper>
            <Stack
              sx={{
                justifyContent: 'space-between',
                mt: 2,
                borderRadius: '8px',
                border: ' 1px solid #ECECEC',
                background: '#FFF',
                boxShadow: ' 0px 1px 9.6px 0px rgba(0, 0, 0, 0.08)',
                flexDirection: 'row',
                padding: '15px',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="body2"
                fontSize="14px"
                className="flex flex-row gap-4 items-center"
              >
                <div style={{ fontSize: '38px', fontWeight: '500' }}>81</div>
                <div>
                  Pending
                  <br /> Invitations
                </div>
              </Typography>
              <Button
                variant="outlined"
                sx={{ color: '#211AEB', borderColor: '#211AEB' }}
              >
                Withdraw
              </Button>
              <Typography
                variant="body2"
                fontSize="14px"
                className="flex flex-row gap-4 items-center"
              >
                <div style={{ fontSize: '38px', fontWeight: '500' }}>{activeChats}</div>
                <div>
                  Active <br /> Chats
                </div>
              </Typography>
              <Typography
                variant="body2"
                fontSize="14px"
                className="flex flex-row gap-4 items-center"
              >
                <div style={{ fontSize: '38px', fontWeight: '500' }}>135</div>
                <div>
                  Profile views <br /> since last week
                </div>
              </Typography>
            </Stack>
          </Stack>
          <Stack sx={{ marginTop: '0px !important', width: '35%' }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" fontWeight="500" fontSize="28px">
                Recent Activity
              </Typography>
              <Stack
                justifyContent="center"
                width="100%"
                alignItems="center"
                height="80%"
              >
                <NotificationsIcon
                  sx={{ color: '#EBEBEB', fontSize: '120px' }}
                />
                <Typography>No activity yet</Typography>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Stack>

      {campaigns.length > 0 && (
        <main className="px-8 py-5">
          <div className="shadow bg-white pt-1 rounded-lg">
            <div className="flex items-center mt-5 ">
              <div className="flex gap-4 items-center w-full pl-3">
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold mr-2">
                    Recent Campaign
                  </h1>
                  <Link style={{ marginTop: '5px', marginLeft: '40px',color:"#211AEB" }} href="/campaign/manage">
                    All Campaign <ChevronRight />
                  </Link>
                </div>
              </div>
              <FilterCampaign />
              <Link href="/campaign/launch/add-leads">
                <Button
                  variant="contained"
                  className="bg-theme flex items-center px-5 py-2 rounded-md mr-2 normal-case min-w-36"
                >
                  New Campaign
                </Button>
              </Link>
            </div>

            <CampaignTable />
          </div>
        </main>
      )}
    </>
  )
}
