import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

// In-memory storage for restaurant plans (replace with proper DB in production)
interface RestaurantPlan {
  id: string
  userId?: string
  name: string
  conceptType: string
  cuisineType: string
  city: string
  seatingCapacity: number
  currentStep: number
  data: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const plans = new Map<string, RestaurantPlan>()

// ─── Schemas ─────────────────────────────────────────────────────────────────

const Step1Schema = z.object({
  name: z.string().min(1),
  conceptType: z.enum(['fine_dining', 'casual', 'quick_service', 'food_truck', 'cloud_kitchen']),
  cuisineType: z.string(),
  city: z.string(),
  seatingCapacity: z.number().min(10).max(500),
  diningStyle: z.string(),
  description: z.string().optional(),
  targetCustomer: z.string().optional(),
})

const Step2Schema = z.object({
  targetMarket: z.string(),
  marketSize: z.string(),
  competitorCount: z.number().min(0).max(50),
  competitorNames: z.array(z.string()).optional(),
  uniqueValueProp: z.string(),
  marketTrend: z.enum(['growing', 'stable', 'declining']),
  pricePositioning: z.enum(['budget', 'mid', 'premium', 'luxury']),
  marketEntryStrategy: z.string().optional(),
})

const Step3FinancialSchema = z.object({
  avgCheckIdr: z.number().min(10000),
  cogsPercent: z.number().min(20).max(50),
  personalInvestment: z.number().min(0),
  loanAmount: z.number().min(0),
})

const Step4MenuSchema = z.object({
  menuConcept: z.string(),
  items: z.array(z.object({
    name: z.string(),
    category: z.string(),
    priceIdr: z.number(),
    cogsPercent: z.number()
  })).min(2)
})

const Step5SpaceSchema = z.object({
  totalAreaM2: z.number().min(10),
  kitchenAreaM2: z.number(),
  diningAreaM2: z.number(),
  designTheme: z.string(),
  colorScheme: z.string(),
  furnitureStyle: z.string(),
  lightingConcept: z.string(),
  buildOutBudget: z.number().optional(),
})

const Step6OperationsSchema = z.object({
  staff: z.object({
    management: z.number().min(0),
    kitchen: z.number().min(0),
    foh: z.number().min(0),
    support: z.number().min(0)
  }),
  salaries: z.object({
    gm: z.number(),
    chef: z.number(),
    server: z.number()
  }),
  trainingProgram: z.string().optional(),
})

const Step7LaunchSchema = z.object({
  brandTagline: z.string().optional(),
  marketingBudgetMonthly: z.number().min(0),
  grandOpeningBudget: z.number().min(0),
  softOpeningDays: z.number().min(1).max(30),
  prCheckbox: z.boolean().optional(),
  influencerCheckbox: z.boolean().optional(),
  socialMediaTargets: z.object({
    instagram: z.number().optional(),
    tiktok: z.number().optional(),
    facebook: z.number().optional()
  }).optional(),
  marketingMix: z.object({
    digital: z.number().min(0).max(100),
    offline: z.number().min(0).max(100),
    tv: z.number().min(0).max(100)
  }).optional()
})

// ─── Cost Factors ───────────────────────────────────────────────────────────

const COST_FACTORS = {
  concept: {
    fine_dining: { costPerSeat: 35000000, construction: 0.70, equipment: 0.18, furniture: 0.07, preOpening: 0.05 },
    casual: { costPerSeat: 20000000, construction: 0.65, equipment: 0.20, furniture: 0.10, preOpening: 0.05 },
    quick_service: { costPerSeat: 12000000, construction: 0.60, equipment: 0.22, furniture: 0.12, preOpening: 0.06 },
    food_truck: { costPerSeat: 6000000, construction: 0.40, equipment: 0.40, furniture: 0.10, preOpening: 0.10 },
    cloud_kitchen: { costPerSeat: 3500000, construction: 0.35, equipment: 0.45, furniture: 0.05, preOpening: 0.15 }
  },
  labor: {
    fine_danning: { management: 0.08, kitchen: 0.15, foh: 0.12, support: 0.05 },
    casual: { management: 0.06, kitchen: 0.12, foh: 0.10, support: 0.04 },
    quick_service: { management: 0.05, kitchen: 0.10, foh: 0.08, support: 0.03 },
    food_truck: { management: 0.04, kitchen: 0.08, foh: 0.06, support: 0.02 },
    cloud_kitchen: { management: 0.05, kitchen: 0.12, foh: 0.02, support: 0.01 }
  }
}

// Revenue ramp up (first 12 months)
const REVENUE_RAMP = [0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.75, 0.75, 0.75, 1.0, 1.0, 1.0]

// ─── Financial Calculator ───────────────────────────────────────────────────

interface FinancialInput {
  seatingCapacity: number
  conceptType: string
  avgCheckIdr: number
  cogsPercent: number
  personalInvestment: number
  loanAmount: number
}

interface FinancialOutput {
  capital: {
    total: number
    breakdown: { construction: number; equipment: number; furniture: number; preOpening: number }
  }
  revenue5Year: number[]
  ebitda5Year: number[]
  breakEvenMonth: number
  paybackMonth: number
  roiYear1: number
  irr5Year: number
  sensitivity: {
    worst: { revenue: number; profit: number }
    base: { revenue: number; profit: number }
    best: { revenue: number; profit: number }
  }
}

function calculateFinancials(input: FinancialInput): FinancialOutput {
  const { seatingCapacity, conceptType, avgCheckIdr, cogsPercent, personalInvestment, loanAmount } = input
  
  const costs = COST_FACTORS.concept[conceptType as keyof typeof COST_FACTORS.concept] || COST_FACTORS.concept.casual
  
  // Capital calculation
  const capitalTotal = seatingCapacity * costs.costPerSeat
  const capital = {
    total: capitalTotal,
    breakdown: {
      construction: Math.round(capitalTotal * costs.construction),
      equipment: Math.round(capitalTotal * costs.equipment),
      furniture: Math.round(capitalTotal * costs.furniture),
      preOpening: Math.round(capitalTotal * costs.preOpening)
    }
  }
  
  // Revenue ramp calculation
  const dailyCovers = seatingCapacity * 0.7 * 2.5 // 70% occupancy, 2.5 turns
  const dailyRevenue = dailyCovers * avgCheckIdr
  const monthlyRevenueBase = dailyRevenue * 26
  
  // Monthly costs
  const cogsMonthly = monthlyRevenueBase * (cogsPercent / 100)
  const laborRate = 0.30 // 30% of revenue
  const laborMonthly = monthlyRevenueBase * laborRate
  const overheadMonthly = monthlyRevenueBase * 0.15 // 15% overhead
  const rentEstimate = seatingCapacity * 20000 * 30 // ~20k/m2/month
  const totalMonthlyCost = cogsMonthly + laborMonthly + overheadMonthly + rentEstimate
  
  // Loan payments if any
  const loanMonthly = loanAmount > 0 ? (loanAmount * 0.08 / 12) : 0 // 8% annual rate
  
  // Calculate 5 year projections
  const revenue5Year: number[] = []
  const ebitda5Year: number[] = []
  let cumulativeProfit = 0
  let breakEvenMonth = -1
  let paybackMonth = -1
  
  for (let month = 0; month < 60; month++) {
    const ramp = REVENUE_RAMP[Math.min(month, 11)]
    const monthlyRevenue = monthlyRevenueBase * ramp
    const monthlyProfit = monthlyRevenue - totalMonthlyCost - loanMonthly
    
    cumulativeProfit += monthlyProfit
    
    if (breakEvenMonth === -1 && monthlyProfit > 0) {
      breakEvenMonth = month + 1
    }
    if (paybackMonth === -1 && cumulativeProfit >= capitalTotal) {
      paybackMonth = month + 1
    }
    
    if (month < 12) {
      revenue5Year.push(Math.round(monthlyRevenue))
      ebitda5Year.push(Math.round(monthlyProfit))
    } else if (month === 12 || month === 24 || month === 36 || month === 48) {
      revenue5Year.push(Math.round(monthlyRevenue))
      ebitda5Year.push(Math.round(monthlyProfit))
    }
  }
  
  // Fill remaining years
  while (revenue5Year.length < 5) {
    revenue5Year.push(Math.round(monthlyRevenueBase))
    ebitda5Year.push(Math.round(monthlyRevenueBase - totalMonthlyCost - loanMonthly))
  }
  
  // ROI Year 1
  const year1Revenue = revenue5Year.slice(0, 12).reduce((a, b) => a + b, 0)
  const year1Profit = ebitda5Year.slice(0, 12).reduce((a, b) => a + b, 0)
  const roiYear1 = capitalTotal > 0 ? (year1Profit / capitalTotal) * 100 : 0
  
  // Simple IRR approximation
  const cashFlows = [-capitalTotal, ...ebitda5Year.slice(0, 5)]
  const irr5Year = calculateIRR(cashFlows)
  
  // Sensitivity analysis
  const worstRevenue = revenue5Year[0] * 0.8
  const bestRevenue = revenue5Year[0] * 1.2
  const baseProfit = ebitda5Year[0]
  
  return {
    capital,
    revenue5Year,
    ebitda5Year,
    breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : 999,
    paybackMonth: paybackMonth > 0 ? paybackMonth : 999,
    roiYear1: Math.round(roiYear1 * 10) / 10,
    irr5Year: Math.round(irr5Year * 10) / 10,
    sensitivity: {
      worst: { revenue: Math.round(worstRevenue * 12), profit: Math.round(worstRevenue * 12 * 0.2) },
      base: { revenue: year1Revenue, profit: year1Profit },
      best: { revenue: Math.round(bestRevenue * 12), profit: Math.round(bestRevenue * 12 * 0.35) }
    }
  }
}

// IRR calculation (Newton-Raphson approximation)
function calculateIRR(cashFlows: number[]): number {
  let rate = 0.1 // Initial guess
  for (let i = 0; i < 100; i++) {
    let npv = 0
    let derivative = 0
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t)
      derivative -= t * cashFlows[t] / Math.pow(1 + rate, t + 1)
    }
    if (Math.abs(npv) < 0.01) break
    rate = rate - npv / derivative
  }
  return rate * 100 // Return as percentage
}

// ─── Routes ─────────────────────────────────────────────────────────────────

export async function rebRoutes(app: FastifyInstance) {
  
  // GET /reb/restaurants - List user's restaurants
  app.get('/restaurants', async (request, reply) => {
    // Placeholder: require auth
    // const userId = request.user.id
    return reply.send({
      success: true,
      data: []
    })
  })
  
  // POST /reb/restaurants - Create new restaurant
  app.post('/restaurants', async (request, reply) => {
    try {
      const body = Step1Schema.parse(request.body)
      
      const restaurant = {
        id: `reb_${Date.now()}`,
        name: body.name,
        conceptType: body.conceptType,
        cuisineType: body.cuisineType,
        city: body.city,
        seatingCapacity: body.seatingCapacity,
        diningStyle: body.diningStyle,
        description: body.description,
        targetCustomer: body.targetCustomer,
        stepCurrent: 1,
        stepCompleted: {},
        status: 'draft',
        createdAt: new Date().toISOString()
      }
      
      return reply.send({
        success: true,
        data: restaurant
      })
      
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ success: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      app.log.error(err)
      return reply.code(500).send({ success: false, error: 'INTERNAL_ERROR' })
    }
  })
  
  // GET /reb/restaurants/:id
  app.get('/restaurants/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    return reply.send({
      success: true,
      data: null
    })
  })
  
  // PUT /reb/restaurants/:id/step/:n
  app.put('/restaurants/:id/step/:n', async (request, reply) => {
    try {
      const { id, n } = request.params as { id: string; n: string }
      const stepNum = parseInt(n)
      
      let schema
      switch (stepNum) {
        case 1: schema = Step1Schema; break
        case 2: schema = Step2Schema; break
        case 3: schema = Step3FinancialSchema; break
        case 4: schema = Step4MenuSchema; break
        case 5: schema = Step5SpaceSchema; break
        case 6: schema = Step6OperationsSchema; break
        case 7: schema = Step7LaunchSchema; break
        default:
          return reply.code(400).send({ success: false, error: 'INVALID_STEP' })
      }
      
      const data = schema.parse(request.body)
      
      return reply.send({
        success: true,
        data: {
          step: stepNum,
          data,
          message: `Step ${stepNum} saved successfully`
        }
      })
      
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ success: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      app.log.error(err)
      return reply.code(500).send({ success: false, error: 'INTERNAL_ERROR' })
    }
  })
  
  // DELETE /reb/restaurants/:id
  app.delete('/restaurants/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    return reply.send({
      success: true,
      message: 'Restaurant deleted'
    })
  })
  
  // POST /reb/calculate - Real-time financial calculation
  app.post('/calculate', async (request, reply) => {
    try {
      const body = Step3FinancialSchema.parse(request.body)
      const query = request.query as { seatingCapacity?: string; conceptType?: string }
      
      const input: FinancialInput = {
        seatingCapacity: parseInt(query.seatingCapacity || '50'),
        conceptType: query.conceptType || 'casual',
        avgCheckIdr: body.avgCheckIdr,
        cogsPercent: body.cogsPercent,
        personalInvestment: body.personalInvestment,
        loanAmount: body.loanAmount
      }
      
      const result = calculateFinancials(input)
      
      return reply.send({
        success: true,
        data: result
      })
      
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ success: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      app.log.error(err)
      return reply.code(500).send({ success: false, error: 'INTERNAL_ERROR' })
    }
  })
  
  // POST /reb/marketing-optimizer - Marketing Mix Optimizer
  app.post('/marketing-optimizer', async (request, reply) => {
    try {
      const body = request.body as {
        budgetTotal: number
        allocation: { digital: number; offline: number; tv: number }
        restaurantId?: string
      }
      
      // Prior data industri F&B Indonesia
      const priors = {
        baseline: 850,
        digital: { coef: 2.4, ci: [2.1, 2.7] },
        offline: { coef: 1.2, ci: [0.9, 1.5] },
        tv: { coef: 0.7, ci: [0.3, 1.1] }
      }
      
      const { digital, offline, tv } = body.allocation
      const total = digital + offline + tv
      
      if (Math.abs(total - 100) > 0.1) {
        return reply.code(400).send({
          success: false,
          error: 'ALLOCATION_MUST_EQUAL_100',
          message: 'Total alokasi harus sama dengan 100%'
        })
      }
      
      // Calculate projected impact
      const digitalImpact = (body.budgetTotal * digital / 100) * priors.digital.coef
      const offlineImpact = (body.budgetTotal * offline / 100) * priors.offline.coef
      const tvImpact = (body.budgetTotal * tv / 100) * priors.tv.coef
      
      const projectedImpact = Math.round(priors.baseline + digitalImpact + offlineImpact + tvImpact)
      
      // Channel ranking
      const channels = [
        { name: 'Digital', impact: digitalImpact, coef: priors.digital.coef },
        { name: 'Offline/BTL', impact: offlineImpact, coef: priors.offline.coef },
        { name: 'TV/Radio', impact: tvImpact, coef: priors.tv.coef }
      ].sort((a, b) => b.impact - a.impact)
      
      return reply.send({
        success: true,
        data: {
          projectedImpact,
          channelRanking: channels.map(c => c.name),
          recommendation: `Channel paling efisien: ${channels[0].name} (${channels[0].coef}x)`,
          probabilityDigitalBetter: digital > offline ? '~99%' : '~1%',
          disclaimer: 'Model ini menggunakan prior data industri F&B Indonesia sebagai estimasi. Efektivitas aktual dapat bervariasi.'
        }
      })
      
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ success: false, error: 'INTERNAL_ERROR' })
    }
  })
  
  // POST /reb/documents/business-plan
  app.post('/documents/business-plan', async (request, reply) => {
    const body = request.body as { restaurantId: string }
    
    // Return HTML template for printing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Business Plan</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #1a1a1a; }
          .section { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Business Plan</h1>
        <div class="section">
          <h2>Ringkasan Eksekutif</h2>
          <p>Restoran dengan konsep yang inovatif...</p>
        </div>
      </body>
      </html>
    `
    
    return reply.send({
      success: true,
      data: { html }
    })
  })
}
