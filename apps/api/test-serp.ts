import 'dotenv/config'
import axios from 'axios'

const SERP_API_KEY = process.env.SERP_API_KEY || 'abb3180fca5b52e17b8baac42a7cb39cfd03fd343facbec344d541a1630f2d5a'

async function test() {
  console.log('Testing SERP API for KFC MANADO...')
  
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERP_API_KEY,
        q: 'KFC',
        location: 'Manado, Indonesia', 
        hl: 'id',
        gl: 'id',
        num: 10,
      },
      timeout: 20000,
    })
    
    console.log('Status:', response.status)
    
    const data = response.data.local_results
    console.log('Local results:', data?.places?.length || 0)
    
    if (data?.places) {
      data.places.slice(0, 5).forEach((p: any, i: number) => {
        console.log(`${i+1}. ${p.title} - ${p.address}`)
      })
    }
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

test()
