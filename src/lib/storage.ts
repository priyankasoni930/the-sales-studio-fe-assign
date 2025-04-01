
import { Coupon, UserClaim, AdminUser } from "./types";

// LocalStorage keys
const COUPONS_KEY = "coupons";
const CLAIMS_KEY = "claims";
const ADMIN_KEY = "admin";
const SESSION_ID_KEY = "session_id";
const LAST_DISTRIBUTED_INDEX_KEY = "last_distributed_index";
const USER_CLAIMED_COUPONS_KEY = "user_claimed_coupons";

// Constants
const COOLDOWN_PERIOD_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds (changed from 24 hours)

// Initialize with sample data if none exists
export const initializeStorage = () => {
  // Create a default admin if none exists
  if (!localStorage.getItem(ADMIN_KEY)) {
    const defaultAdmin: AdminUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
    };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmin));
  }

  // Initialize coupons if none exist
  if (!localStorage.getItem(COUPONS_KEY)) {
    const sampleCoupons: Coupon[] = [
      {
        id: "1",
        code: "FREE10",
        description: "10% off your first purchase",
        isActive: true,
        isUsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        code: "WELCOME20",
        description: "20% off for new customers",
        isActive: true,
        isUsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        code: "SUMMER15",
        description: "15% off summer collection",
        isActive: true,
        isUsed: false,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(COUPONS_KEY, JSON.stringify(sampleCoupons));
  }

  // Initialize claims if none exist
  if (!localStorage.getItem(CLAIMS_KEY)) {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify([]));
  }

  // Initialize session ID if none exists
  if (!localStorage.getItem(SESSION_ID_KEY)) {
    const sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  // Initialize last distributed index if none exists
  if (!localStorage.getItem(LAST_DISTRIBUTED_INDEX_KEY)) {
    localStorage.setItem(LAST_DISTRIBUTED_INDEX_KEY, "-1"); // Start from -1 so first coupon will be at index 0
  }
  
  // Initialize user claimed coupons if none exist
  if (!localStorage.getItem(USER_CLAIMED_COUPONS_KEY)) {
    localStorage.setItem(USER_CLAIMED_COUPONS_KEY, JSON.stringify({}));
  }
};

// Get all coupons
export const getCoupons = (): Coupon[] => {
  const coupons = localStorage.getItem(COUPONS_KEY);
  return coupons ? JSON.parse(coupons) : [];
};

// Get active coupons
export const getActiveCoupons = (): Coupon[] => {
  return getCoupons().filter((coupon) => coupon.isActive && !coupon.isUsed);
};

// Get user claimed coupons
const getUserClaimedCoupons = (): Record<string, string[]> => {
  const userCoupons = localStorage.getItem(USER_CLAIMED_COUPONS_KEY);
  return userCoupons ? JSON.parse(userCoupons) : {};
};

// Save user claimed coupon
const saveUserClaimedCoupon = (sessionId: string, couponId: string): void => {
  const userCoupons = getUserClaimedCoupons();
  
  if (!userCoupons[sessionId]) {
    userCoupons[sessionId] = [];
  }
  
  userCoupons[sessionId].push(couponId);
  localStorage.setItem(USER_CLAIMED_COUPONS_KEY, JSON.stringify(userCoupons));
};

// Get next available coupon - updated to use round-robin distribution and avoid giving same coupon to same user
export const getNextAvailableCoupon = (): Coupon | null => {
  const activeCoupons = getActiveCoupons();
  
  if (activeCoupons.length === 0) {
    return null;
  }
  
  const sessionId = getSessionId();
  const userCoupons = getUserClaimedCoupons();
  const claimedIds = userCoupons[sessionId] || [];
  
  // Filter out coupons this user has already claimed
  const availableCoupons = activeCoupons.filter(coupon => !claimedIds.includes(coupon.id));
  
  // If user has claimed all available coupons, return the first active one (round-robin will still apply)
  if (availableCoupons.length === 0) {
    // Get the last distributed index
    const lastIndexStr = localStorage.getItem(LAST_DISTRIBUTED_INDEX_KEY);
    let lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;
    
    // Find the next available index in round-robin fashion
    let nextIndex = (lastIndex + 1) % activeCoupons.length;
    
    // Update the last distributed index
    localStorage.setItem(LAST_DISTRIBUTED_INDEX_KEY, nextIndex.toString());
    
    return activeCoupons[nextIndex];
  }
  
  // Use round-robin among the available coupons this user hasn't claimed yet
  const lastIndexStr = localStorage.getItem(LAST_DISTRIBUTED_INDEX_KEY);
  let lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;
  
  // Find the next index within available coupons
  let nextIndex = (lastIndex + 1) % availableCoupons.length;
  
  // Update the last distributed index
  localStorage.setItem(LAST_DISTRIBUTED_INDEX_KEY, nextIndex.toString());
  
  return availableCoupons[nextIndex];
};

// Save a coupon
export const saveCoupon = (coupon: Coupon): void => {
  const coupons = getCoupons();
  const existingIndex = coupons.findIndex((c) => c.id === coupon.id);

  if (existingIndex >= 0) {
    coupons[existingIndex] = coupon;
  } else {
    coupons.push(coupon);
  }

  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
};

// Add a new coupon
export const addCoupon = (coupon: Omit<Coupon, "id" | "createdAt" | "isUsed">): Coupon => {
  const newCoupon: Coupon = {
    ...coupon,
    id: generateId(),
    isUsed: false,
    createdAt: new Date().toISOString(),
  };
  
  const coupons = getCoupons();
  coupons.push(newCoupon);
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  
  return newCoupon;
};

// Get all claims
export const getClaims = (): UserClaim[] => {
  const claims = localStorage.getItem(CLAIMS_KEY);
  return claims ? JSON.parse(claims) : [];
};

// Add a new claim
export const addClaim = (claim: Omit<UserClaim, "id" | "timestamp">): UserClaim => {
  const newClaim: UserClaim = {
    ...claim,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  
  const claims = getClaims();
  claims.push(newClaim);
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  
  // Also save this coupon as claimed by this user
  saveUserClaimedCoupon(claim.sessionId, claim.couponId);
  
  return newClaim;
};

// Mark a coupon as used
export const markCouponAsUsed = (couponId: string, claim: UserClaim): void => {
  const coupons = getCoupons();
  const couponIndex = coupons.findIndex((c) => c.id === couponId);
  
  if (couponIndex >= 0) {
    coupons[couponIndex] = {
      ...coupons[couponIndex],
      isUsed: true,
      usedAt: new Date().toISOString(),
      usedBy: claim,
    };
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  }
};

// Toggle coupon active status
export const toggleCouponStatus = (couponId: string): Coupon | null => {
  const coupons = getCoupons();
  const couponIndex = coupons.findIndex((c) => c.id === couponId);
  
  if (couponIndex >= 0) {
    coupons[couponIndex] = {
      ...coupons[couponIndex],
      isActive: !coupons[couponIndex].isActive,
    };
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    return coupons[couponIndex];
  }
  
  return null;
};

// Get admin user
export const getAdmin = (): AdminUser | null => {
  const admin = localStorage.getItem(ADMIN_KEY);
  return admin ? JSON.parse(admin) : null;
};

// Validate admin credentials
export const validateAdmin = (username: string, password: string): boolean => {
  const admin = getAdmin();
  return admin ? admin.username === username && admin.password === password : false;
};

// Get the user's session ID
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
};

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to generate a session ID
export const generateSessionId = (): string => {
  return 'session_' + generateId();
};

// Check if user can claim a coupon (cooldown period)
export const canClaimCoupon = (ip: string, sessionId: string): { canClaim: boolean; timeLeft: number } => {
  const claims = getClaims();
  const cooldownPeriod = COOLDOWN_PERIOD_MS; // Use the constant instead of hardcoding the value
  
  // Find the most recent claim from this IP or session
  const lastClaim = claims
    .filter((claim) => claim.ip === ip || claim.sessionId === sessionId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  
  if (!lastClaim) {
    return { canClaim: true, timeLeft: 0 };
  }
  
  const lastClaimTime = new Date(lastClaim.timestamp).getTime();
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastClaimTime;
  
  if (timeDiff < cooldownPeriod) {
    const timeLeft = cooldownPeriod - timeDiff;
    return { canClaim: false, timeLeft };
  }
  
  return { canClaim: true, timeLeft: 0 };
};

