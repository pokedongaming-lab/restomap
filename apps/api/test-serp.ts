import 'dotenv/config'
import axios from 'axios'

const SERP_API_KEY = process.env.SERP_API_KEY || 'abb3180fca5b52e17b8baac42a7cb39cfd03fd343facbec344d541a1630f2d5a'

async function test() {
  console.log('Testing SERP API for KFC...')
  
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERP_API_KEY,
        q: 'KFC restaurant Manila',
        location: 'Manado, Indonesia',
        hl: 'id',
        gl: 'id',
        num: 10,
      },
      timeout: 20000,
    })
    
    console.log('Status:', response.status)
    
    const data = response.data
    console.log('local_results type:', typeof data.local_results)
    console.log('local_results value:', JSON.stringify(data.local_results).slice(0, 300))
    
    // Try different query
    console.log('\n--- Trying different query: KFC Manila ---')
    const response2 = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERP_API_KEY,
        q: 'KFC Manila',
        location: 'Manado, Indonesia', 
        hl: 'id',
        gl: 'id',
        num: 10,
      },
      timeout: 20000,
    })
    
    console.log('local_results:', JSON.stringify(response2.data.local_results).slice(0, 300))
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

test()
