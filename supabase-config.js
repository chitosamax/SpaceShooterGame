// Supabase configuration
const SUPABASE_URL = 'https://acntwfcdlbmblloquwpw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbnR3ZmNkbGJtYmxsb3F1d3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NDM1NTUsImV4cCI6MjA1NzMxOTU1NX0.aC3G_WhhKLwmTu93fwMNs31nN7E13b5MuL6nk9Ltfe8';

// Initialize the Supabase client
let supabaseClient;
try {
    // Check if the Supabase library is available
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client created successfully");
    } else {
        console.error("Supabase library not available");
    }
} catch (err) {
    console.error("Failed to create Supabase client:", err);
}

// Global variables for Supabase session
let currentSession = null;
let isSupabaseInitialized = false;
let globalLeaderboard = [];
let leaderboardSubscription = null;

// Initialize Supabase and authenticate anonymously
async function initializeSupabase() {
    try {
        console.log("Initializing Supabase connection...");
        
        // Check if Supabase client was created successfully
        if (!supabaseClient) {
            console.error("Supabase client not available, skipping initialization");
            document.getElementById('loading-overlay').style.display = 'none';
            return false;
        }
        
        // Sign in anonymously
        const { data, error } = await supabaseClient.auth.signInAnonymously();
        
        if (error) {
            console.error("Error signing in anonymously:", error.message);
            document.getElementById('loading-overlay').style.display = 'none';
            return false;
        }
        
        currentSession = data.session;
        console.log("Anonymous session created:", currentSession.user.id);
        
        // Set up real-time subscription for leaderboard
        setupLeaderboardSubscription();
        
        // Load initial leaderboard data
        await loadLeaderboardFromSupabase();
        
        isSupabaseInitialized = true;
        window.isSupabaseInitialized = true;
        console.log("Supabase initialized successfully");
        
        // Hide loading overlay
        document.getElementById('loading-overlay').style.display = 'none';
        
        return true;
    } catch (err) {
        console.error("Failed to initialize Supabase:", err);
        // Hide loading overlay in case of error
        document.getElementById('loading-overlay').style.display = 'none';
        return false;
    }
}

// Load leaderboard data from Supabase
async function loadLeaderboardFromSupabase() {
    try {
        if (!supabaseClient) {
            console.warn("Supabase client not available, skipping leaderboard load");
            return [];
        }
        
        console.log("Loading leaderboard from Supabase...");
        
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error("Error loading leaderboard:", error.message);
            return [];
        }
        
        // Log each entry to verify all fields are present
        console.log("Leaderboard data received from Supabase:");
        data.forEach((entry, index) => {
            console.log(`Entry ${index + 1}:`, {
                id: entry.id,
                initials: entry.player_initials,
                email: entry.player_email,
                score: entry.score,
                difficulty: entry.difficulty,
                created_at: entry.created_at
            });
        });
        
        // Check if emails are present
        const emailsPresent = data.some(entry => entry.player_email);
        console.log("Emails present in leaderboard data:", emailsPresent);
        
        globalLeaderboard = data;
        window.globalLeaderboard = data;
        console.log("Leaderboard loaded:", globalLeaderboard);
        return data;
    } catch (err) {
        console.error("Failed to load leaderboard:", err);
        return [];
    }
}

// Save score to Supabase
async function saveScoreToSupabase(initials, email, score, difficulty) {
    try {
        console.log("Attempting to save score to Supabase with data:", {
            initials,
            email,
            score,
            difficulty
        });
        
        if (!isSupabaseInitialized || !currentSession || !supabaseClient) {
            console.error("Supabase not initialized or no active session");
            return false;
        }
        
        const scoreData = { 
            player_initials: initials,
            player_email: email,
            score: score,
            difficulty: difficulty,
            user_id: currentSession.user.id
        };
        
        console.log("Sending data to Supabase:", scoreData);
        
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .insert([scoreData]);
        
        if (error) {
            console.error("Error saving score:", error.message, error);
            return false;
        }
        
        console.log("Score saved successfully:", data);
        
        // Immediately fetch the updated leaderboard to confirm the data was saved
        const { data: leaderboardData, error: leaderboardError } = await supabaseClient
            .from('leaderboard')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (leaderboardError) {
            console.error("Error fetching latest leaderboard entry:", leaderboardError);
        } else {
            console.log("Latest leaderboard entry:", leaderboardData);
        }
        
        return true;
    } catch (err) {
        console.error("Failed to save score:", err);
        return false;
    }
}

// Set up real-time subscription for leaderboard updates
function setupLeaderboardSubscription() {
    try {
        if (!supabaseClient) {
            console.warn("Supabase client not available, skipping subscription setup");
            return;
        }
        
        // Clean up existing subscription if any
        if (leaderboardSubscription) {
            leaderboardSubscription.unsubscribe();
        }
        
        leaderboardSubscription = supabaseClient
            .channel('public:leaderboard')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'leaderboard' }, 
                payload => {
                    console.log("Leaderboard update received:", payload);
                    // Reload leaderboard data when changes occur
                    loadLeaderboardFromSupabase();
                }
            )
            .subscribe();
            
        console.log("Leaderboard subscription set up");
    } catch (err) {
        console.error("Failed to set up leaderboard subscription:", err);
    }
}

// Generate a shareable URL for social media
function generateShareableURL(playerInitials, score, difficulty) {
    const baseURL = window.location.origin + window.location.pathname;
    const shareText = `I scored ${score} points on ${difficulty} difficulty in AI DEFENDER! Can you beat my score? Play now:`;
    const shareURL = `${baseURL}?ref=${playerInitials}`;
    
    return {
        url: shareURL,
        text: shareText
    };
}

// Share score to X (Twitter)
function shareScoreToX(playerInitials, score, difficulty) {
    const { text, url } = generateShareableURL(playerInitials, score, difficulty);
    const hashtags = 'AIDefender,GameDev,AI';
    
    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    // Open Twitter share dialog in a new window
    window.open(twitterURL, '_blank', 'width=550,height=420');
    
    return true;
}

// Debug function to manually refresh the leaderboard
async function debugRefreshLeaderboard() {
    console.log("Manual leaderboard refresh requested");
    
    try {
        if (!supabaseClient) {
            console.error("Supabase client not available");
            return "ERROR: Supabase client not available";
        }
        
        // Direct query to check all leaderboard entries
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching leaderboard:", error);
            return "ERROR: " + error.message;
        }
        
        console.log("All leaderboard entries:", data);
        
        // Check for email fields specifically
        const entriesWithEmail = data.filter(entry => entry.player_email && entry.player_email.trim() !== "");
        console.log("Entries with email:", entriesWithEmail);
        
        // Update the global leaderboard with the top 10 scores
        const topScores = [...data].sort((a, b) => b.score - a.score).slice(0, 10);
        globalLeaderboard = topScores;
        window.globalLeaderboard = topScores;
        
        // If the game's leaderboard variable is accessible, update it too
        if (window.leaderboard) {
            window.leaderboard = topScores;
        }
        
        return {
            totalEntries: data.length,
            entriesWithEmail: entriesWithEmail.length,
            topScores: topScores
        };
    } catch (err) {
        console.error("Error in debug refresh:", err);
        return "ERROR: " + err.message;
    }
}

// Export functions to global scope for access from sketch.js
window.supabaseClient = supabaseClient;
window.isSupabaseInitialized = isSupabaseInitialized;
window.globalLeaderboard = globalLeaderboard;
window.initializeSupabase = initializeSupabase;
window.loadLeaderboardFromSupabase = loadLeaderboardFromSupabase;
window.saveScoreToSupabase = saveScoreToSupabase;
window.shareScoreToX = shareScoreToX;

// Export the debug function to the global scope
window.debugRefreshLeaderboard = debugRefreshLeaderboard;

// Initialize Supabase when the page loads
document.addEventListener('DOMContentLoaded', initializeSupabase); 