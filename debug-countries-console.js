// Countries Loading Debug Script
// Run this in the browser console to debug countries loading issues

console.log('🔍 Starting Countries Debug...');

// Check if Supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client found');
} else {
  console.log('❌ Supabase client not found - this might be the issue');
}

// Check app state
const storedData = localStorage.getItem('quarterback-app-state');
if (storedData) {
  const appState = JSON.parse(storedData);
  console.log('📊 App State Analysis:');
  console.log('- Countries in app state:', appState.countries?.length || 0);
  console.log('- Settings countries:', appState.settings?.countries?.length || 0);
  console.log('- Countries array:', appState.countries);
  console.log('- Settings object:', appState.settings);
} else {
  console.log('❌ No app state found in localStorage');
}

// Check if countries are being loaded from database
async function debugCountriesLoading() {
  try {
    // Import Supabase dynamically
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
    
    // Get environment variables
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || localStorage.getItem('supabase-url');
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase-key');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase credentials not found');
      return;
    }
    
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('🔑 Supabase Key:', supabaseKey.substring(0, 20) + '...');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test countries query
    console.log('📡 Querying countries table...');
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.log('❌ Countries query failed:', error);
    } else {
      console.log('✅ Countries query successful');
      console.log('📊 Countries found:', data?.length || 0);
      console.log('🌍 Sample countries:', data?.slice(0, 5));
      
      // Check if this matches what's in the app state
      const storedData = localStorage.getItem('quarterback-app-state');
      if (storedData) {
        const appState = JSON.parse(storedData);
        const appCountries = appState.countries || [];
        console.log('🔄 Comparing with app state:');
        console.log('- Database countries:', data?.length || 0);
        console.log('- App state countries:', appCountries.length);
        console.log('- Match:', data?.length === appCountries.length ? '✅' : '❌');
      }
    }
  } catch (error) {
    console.log('❌ Debug failed:', error);
  }
}

// Run the debug function
debugCountriesLoading();

// Provide helper functions
window.debugCountries = debugCountriesLoading;
window.fixCountries = async () => {
  try {
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || localStorage.getItem('supabase-url');
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase-key');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase credentials not found');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.log('❌ Failed to load countries:', error);
      return;
    }
    
    // Update localStorage
    const storedData = localStorage.getItem('quarterback-app-state');
    if (storedData) {
      const appState = JSON.parse(storedData);
      appState.countries = data || [];
      localStorage.setItem('quarterback-app-state', JSON.stringify(appState));
      console.log('✅ Countries updated in localStorage');
      console.log('🔄 Please refresh the page to see changes');
    }
  } catch (error) {
    console.log('❌ Fix failed:', error);
  }
};

console.log('🛠️ Helper functions available:');
console.log('- debugCountries() - Run the debug again');
console.log('- fixCountries() - Fix countries loading');
