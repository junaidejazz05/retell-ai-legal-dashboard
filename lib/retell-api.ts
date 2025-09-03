export interface Call {
  call_id: string;
  agent_id: string;
  call_status: string;
  direction: string;
  duration_ms: number;
  start_timestamp: number;
  end_timestamp: number;
  from_number?: string;
  to_number?: string;
  call_analysis?: {
    user_sentiment?: string;
    call_successful?: boolean;
    call_summary?: string;
  };
  call_cost?: {
    combined_cost?: number;
  };
  transcript?: string;
}

export interface CallsResponse {
  calls: Call[];
  next_cursor?: string | null;
}

export async function fetchCalls(filters?: {
  cursor?: string;
  limit?: number;
  direction?: 'inbound' | 'outbound';
  start_timestamp_from?: number;
  start_timestamp_to?: number;
  agent_id?: string;
}): Promise<CallsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.cursor) params.set('cursor', filters.cursor);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.direction) params.set('direction', filters.direction);
    if (filters?.start_timestamp_from) params.set('start_timestamp_from', String(filters.start_timestamp_from));
    if (filters?.start_timestamp_to) params.set('start_timestamp_to', String(filters.start_timestamp_to));
    if (filters?.agent_id) params.set('agent_id', filters.agent_id);

    const url = params.toString() ? `/api/calls?${params.toString()}` : '/api/calls';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to fetch calls');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching calls:', error);
    throw error;
  }
}

export async function fetchCallById(callId: string): Promise<Call> {
  try {
    const response = await fetch(`/api/calls/${callId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch call details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching call details:', error);
    throw error;
  }
}

// Utility functions to calculate metrics from calls
export function calculateMetrics(calls: Call[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTimestamp = yesterday.getTime();
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoTimestamp = weekAgo.getTime();
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoTimestamp = monthAgo.getTime();

  // Filter calls by time periods
  const todayCalls = calls.filter(call => call.start_timestamp >= todayTimestamp);
  const yesterdayCalls = calls.filter(call => 
    call.start_timestamp >= yesterdayTimestamp && call.start_timestamp < todayTimestamp
  );
  const lastWeekCalls = calls.filter(call => call.start_timestamp >= weekAgoTimestamp);
  const lastMonthCalls = calls.filter(call => call.start_timestamp >= monthAgoTimestamp);

  // Calculate metrics
  const totalCallsAllTime = calls.length;
  const totalCallsToday = todayCalls.length;
  const totalCallsYesterday = yesterdayCalls.length;
  
  // Calculate percentage change from yesterday
  const percentChangeFromYesterday = yesterdayCalls.length > 0 
    ? ((totalCallsToday - totalCallsYesterday) / totalCallsYesterday) * 100 
    : 0;

  // Calculate new client calls (for demo, we'll consider calls with positive sentiment as new clients)
  const newClientCalls = todayCalls.filter(call => 
    call.call_analysis?.user_sentiment === 'Positive'
  ).length;
  
  const newClientCallsLastWeek = lastWeekCalls.filter(call => 
    call.call_analysis?.user_sentiment === 'Positive'
  ).length;
  
  const percentChangeNewClients = newClientCallsLastWeek > 0
    ? ((newClientCalls - (newClientCallsLastWeek / 7)) / (newClientCallsLastWeek / 7)) * 100
    : 0;

  // Calculate average call duration
  const avgDurationMs = calls.reduce((sum, call) => sum + (call.duration_ms || 0), 0) / (calls.length || 1);
  const avgDurationMinutes = Math.floor(avgDurationMs / 60000);
  const avgDurationSeconds = Math.floor((avgDurationMs % 60000) / 1000);
  
  const avgDurationLastMonth = lastMonthCalls.reduce((sum, call) => sum + (call.duration_ms || 0), 0) / (lastMonthCalls.length || 1);
  const durationDiffMs = avgDurationMs - avgDurationLastMonth;
  const durationDiffMinutes = Math.floor(Math.abs(durationDiffMs) / 60000);
  const durationDiffSeconds = Math.floor((Math.abs(durationDiffMs) % 60000) / 1000);

  // Calculate conversion rate (successful calls)
  const successfulCalls = todayCalls.filter(call => call.call_analysis?.call_successful).length;
  const conversionRate = todayCalls.length > 0 ? (successfulCalls / todayCalls.length) * 100 : 0;
  
  const lastQuarterCalls = calls.filter(call => {
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return call.start_timestamp >= threeMonthsAgo.getTime();
  });
  
  const lastQuarterSuccessful = lastQuarterCalls.filter(call => call.call_analysis?.call_successful).length;
  const lastQuarterConversionRate = lastQuarterCalls.length > 0 
    ? (lastQuarterSuccessful / lastQuarterCalls.length) * 100 
    : 0;
  
  const conversionRateChange = conversionRate - lastQuarterConversionRate;

  return {
    totalCallsAllTime,
    totalCallsToday,
    percentChangeFromYesterday,
    newClientCalls,
    percentChangeNewClients,
    avgDuration: `${avgDurationMinutes}:${avgDurationSeconds.toString().padStart(2, '0')}`,
    durationChange: durationDiffMs >= 0 ? '+' : '-',
    durationDiff: `${durationDiffMinutes}:${durationDiffSeconds.toString().padStart(2, '0')}`,
    conversionRate: Math.round(conversionRate),
    conversionRateChange,
  };
}

// Calculate data for charts
export function getWeeklyCallVolume(calls: Call[]) {
  const today = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayCalls = calls.filter(call => 
      call.start_timestamp >= date.getTime() && call.start_timestamp < nextDate.getTime()
    );
    
    // Separate by call type (incoming vs outgoing)
    const incoming = dayCalls.filter(call => call.direction === 'inbound').length;
    const outgoing = dayCalls.filter(call => call.direction === 'outbound').length;
    
    data.push({
      day: dayName,
      incoming,
      outgoing,
    });
  }
  
  return data;
}

export function getCallTypesDistribution(calls: Call[]) {
  // For demo purposes, we'll categorize based on call duration and sentiment
  const categories = {
    'Initial Consultation': 0,
    'Follow-up': 0,
    'Case Update': 0,
    'Emergency': 0,
    'Other': 0,
  };
  
  calls.forEach(call => {
    const duration = call.duration_ms / 60000; // Convert to minutes
    
    if (duration > 15 && call.call_analysis?.user_sentiment === 'Positive') {
      categories['Initial Consultation']++;
    } else if (duration > 10 && duration <= 15) {
      categories['Case Update']++;
    } else if (duration > 5 && duration <= 10) {
      categories['Follow-up']++;
    } else if (duration <= 5) {
      categories['Emergency']++;
    } else {
      categories['Other']++;
    }
  });
  
  return Object.entries(categories).map(([category, count], index) => ({
    category,
    count,
    fill: `var(--color-chart-${index + 1})`,
  }));
}

export function getMonthlyPerformance(calls: Call[]) {
  const today = new Date();
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const monthCalls = calls.filter(call => 
      call.start_timestamp >= date.getTime() && call.start_timestamp < nextMonth.getTime()
    );
    
    const successfulCalls = monthCalls.filter(call => call.call_analysis?.call_successful).length;
    const conversionRate = monthCalls.length > 0 ? (successfulCalls / monthCalls.length) * 100 : 0;
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      calls: monthCalls.length,
      conversionRate: Math.round(conversionRate),
    });
  }
  
  return data;
}

export function getCallDurationTrends(calls: Call[]) {
  const today = new Date();
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayCalls = calls.filter(call => 
      call.start_timestamp >= date.getTime() && call.start_timestamp < nextDate.getTime()
    );
    
    const avgDuration = dayCalls.reduce((sum, call) => sum + (call.duration_ms || 0), 0) / (dayCalls.length || 1);
    const avgDurationMinutes = avgDuration / 60000;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: Math.round(avgDurationMinutes * 10) / 10, // Round to 1 decimal
    });
  }
  
  return data;
}
