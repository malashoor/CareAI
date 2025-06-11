import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/hooks/useNotifications';

export type RefillStatus = 'pending' | 'processing' | 'ready_for_pickup' | 'delivered' | 'cancelled';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

interface StatusUpdate {
  id: string;
  item_id: string;
  item_type: 'refill' | 'claim';
  old_status: string;
  new_status: string;
  updated_by: string;
  notes?: string;
  created_at: Date;
}

export async function updateRefillStatus(
  refillId: string,
  newStatus: RefillStatus,
  userId: string,
  notes?: string
): Promise<void> {
  try {
    // Get the current refill status
    const { data: refill, error: refillError } = await supabase
      .from('pharmacy_refills')
      .select('status, user_id')
      .eq('id', refillId)
      .single();

    if (refillError) throw refillError;

    // Update the refill status
    const { error: updateError } = await supabase
      .from('pharmacy_refills')
      .update({ status: newStatus })
      .eq('id', refillId);

    if (updateError) throw updateError;

    // Record the status change
    const { error: historyError } = await supabase
      .from('status_updates')
      .insert({
        item_id: refillId,
        item_type: 'refill',
        old_status: refill.status,
        new_status: newStatus,
        updated_by: userId,
        notes,
      });

    if (historyError) throw historyError;

    // Send notification to the user
    const notificationTitle = 'Refill Status Updated';
    const notificationBody = getRefillStatusMessage(newStatus);
    
    await sendStatusNotification(
      refill.user_id,
      notificationTitle,
      notificationBody,
      {
        type: 'refill_status_update',
        refillId,
        newStatus,
      }
    );
  } catch (error) {
    console.error('Error updating refill status:', error);
    throw error;
  }
}

export async function updateClaimStatus(
  claimId: string,
  newStatus: ClaimStatus,
  userId: string,
  notes?: string
): Promise<void> {
  try {
    // Get the current claim status
    const { data: claim, error: claimError } = await supabase
      .from('insurance_claims')
      .select('status, user_id')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;

    // Update the claim status
    const { error: updateError } = await supabase
      .from('insurance_claims')
      .update({ status: newStatus })
      .eq('id', claimId);

    if (updateError) throw updateError;

    // Record the status change
    const { error: historyError } = await supabase
      .from('status_updates')
      .insert({
        item_id: claimId,
        item_type: 'claim',
        old_status: claim.status,
        new_status: newStatus,
        updated_by: userId,
        notes,
      });

    if (historyError) throw historyError;

    // Send notification to the user
    const notificationTitle = 'Claim Status Updated';
    const notificationBody = getClaimStatusMessage(newStatus);
    
    await sendStatusNotification(
      claim.user_id,
      notificationTitle,
      notificationBody,
      {
        type: 'claim_status_update',
        claimId,
        newStatus,
      }
    );
  } catch (error) {
    console.error('Error updating claim status:', error);
    throw error;
  }
}

async function sendStatusNotification(
  userId: string,
  title: string,
  body: string,
  data: Record<string, any>
): Promise<void> {
  try {
    // Get the user's notification token
    const { data: userData, error: userError } = await supabase
      .from('user_notifications')
      .select('notification_token')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    if (userData?.notification_token) {
      // Send push notification using Expo's push notification service
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userData.notification_token,
          title,
          body,
          data,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending status notification:', error);
  }
}

function getRefillStatusMessage(status: RefillStatus): string {
  const messages: Record<RefillStatus, string> = {
    pending: 'Your refill request has been submitted',
    processing: 'Your refill is being processed',
    ready_for_pickup: 'Your medication is ready for pickup',
    delivered: 'Your medication has been delivered',
    cancelled: 'Your refill request has been cancelled',
  };
  return messages[status];
}

function getClaimStatusMessage(status: ClaimStatus): string {
  const messages: Record<ClaimStatus, string> = {
    pending: 'Your insurance claim has been submitted',
    approved: 'Your insurance claim has been approved',
    rejected: 'Your insurance claim has been rejected',
  };
  return messages[status];
} 