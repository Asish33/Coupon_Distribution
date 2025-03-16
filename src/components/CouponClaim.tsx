import React, { useEffect, useState } from 'react';
import { Ticket, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function CouponClaim() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const generateBrowserId = () => {
    let id = localStorage.getItem('browser_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('browser_id', id);
    }
    return id;
  };

  const checkCooldown = async (browserId: string) => {
    const { data: cooldowns } = await supabase
      .from('cooldowns')
      .select('last_claim')
      .eq('browser_id', browserId)
      .order('last_claim', { ascending: false })
      .limit(1);

    if (cooldowns && cooldowns.length > 0) {
      const lastClaim = new Date(cooldowns[0].last_claim);
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
      const canClaimAfter = new Date(lastClaim.getTime() + cooldownPeriod);
      
      if (canClaimAfter > new Date()) {
        setCooldown(true);
        return true;
      }
    }
    return false;
  };

  const claimCoupon = async () => {
    try {
      setLoading(true);
      const browserId = generateBrowserId();
      
      const isOnCooldown = await checkCooldown(browserId);
      if (isOnCooldown) {
        toast.error('Please wait 24 hours between claims');
        return;
      }

      // Changed from .single() to handle empty results properly
      const { data: coupons, error: couponError } = await supabase
        .from('coupons')
        .select('id, code')
        .eq('is_active', true)
        .eq('is_claimed', false)
        .order('created_at')
        .limit(1);

      if (couponError) throw couponError;
      
      if (!coupons || coupons.length === 0) {
        throw new Error('No coupons available at the moment');
      }

      const coupon = coupons[0];

      const { error: claimError } = await supabase.from('claims').insert({
        coupon_id: coupon.id,
        browser_id: browserId,
        ip_address: 'Handled by RLS',
      });

      if (claimError) throw claimError;

      const { error: updateError } = await supabase
        .from('coupons')
        .update({ is_claimed: true })
        .eq('id', coupon.id);

      if (updateError) throw updateError;

      await supabase.from('cooldowns').insert({
        browser_id: browserId,
        ip_address: 'Handled by RLS',
      });

      toast.success(`Your coupon code: ${coupon.code}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const browserId = generateBrowserId();
    checkCooldown(browserId);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg relative">
        <Link
          to="/admin/login"
          className="absolute top-4 right-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <LogIn className="h-4 w-4 mr-1" />
          Admin Login
        </Link>
        
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Ticket className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Claim Your Coupon
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get a unique discount code instantly
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={claimCoupon}
            disabled={loading || cooldown}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              cooldown
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? 'Processing...' : cooldown ? 'Please wait 24 hours' : 'Claim Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}