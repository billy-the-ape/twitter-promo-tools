import { Campaign } from '@/types';

export const postUpsertCampaign = async (campaign: Campaign) =>
  await fetch('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaign),
  });

export const deleteCampaigns = async (campaignIds: string[]) => {
  if (!campaignIds || !campaignIds.length) {
    return;
  }
  const { ok } = await fetch(`/api/campaigns/${campaignIds.join(',')}`, {
    method: 'DELETE',
  });
  return ok;
};

export const patchHideCampaigns = async (campaignIds: string[]) => {
  if (!campaignIds || !campaignIds.length) {
    return;
  }
  const { ok } = await fetch(
    `api/campaigns/${campaignIds.join(',')}?hide=true`,
    {
      method: 'PATCH',
    }
  );
  return ok;
};

export const patchUnhideCampaigns = async (campaignIds: string[]) => {
  const { ok } = await fetch(
    `api/campaigns/${campaignIds.join(',')}?unhide=true`,
    {
      method: 'PATCH',
    }
  );
  return ok;
};

export const deleteTweetFromCampaign = async (
  campaignId: string,
  tweetId: string
) => {
  const { ok } = await fetch(`/api/campaigns/${campaignId}/${tweetId}`, {
    method: 'DELETE',
  });
  return ok;
};

export const submitTweetsToCampaign = async (
  campaignId: string,
  tweetIds: string[]
) => {
  const { status } = await fetch(`/api/campaigns/${campaignId}`, {
    method: 'POST',
    body: JSON.stringify(tweetIds),
  });
  return status;
};
