import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeChannelSyncOptions {
  channelId?: string;
  viewerId?: string;
  refreshChannel?: () => Promise<void> | void;
  refreshMedia?: () => Promise<void> | void;
  refreshDeletedChannel?: () => Promise<void> | void;
  refreshAccess?: () => Promise<void> | void;
}

export const useRealtimeChannelSync = ({
  channelId,
  viewerId,
  refreshChannel,
  refreshMedia,
  refreshDeletedChannel,
  refreshAccess,
}: UseRealtimeChannelSyncOptions) => {
  const handlers = useMemo(
    () => ({
      refreshChannel,
      refreshMedia,
      refreshDeletedChannel,
      refreshAccess,
    }),
    [refreshAccess, refreshChannel, refreshDeletedChannel, refreshMedia],
  );

  useEffect(() => {
    if (!channelId) return;

    const realtimeChannel = supabase.channel(`channel-sync:${channelId}:${viewerId ?? "guest"}`);

    realtimeChannel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "channels",
        filter: `id=eq.${channelId}`,
      },
      () => {
        handlers.refreshChannel?.();
        handlers.refreshMedia?.();
        handlers.refreshAccess?.();
      },
    );

    realtimeChannel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "media_content",
        filter: `channel_id=eq.${channelId}`,
      },
      () => {
        handlers.refreshMedia?.();
      },
    );

    realtimeChannel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deleted_channels",
        filter: `original_channel_id=eq.${channelId}`,
      },
      () => {
        handlers.refreshDeletedChannel?.();
        handlers.refreshChannel?.();
      },
    );

    if (viewerId) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_premium_subscriptions",
          filter: `user_id=eq.${viewerId}`,
        },
        (payload) => {
          const changedChannelId = payload.new?.channel_id ?? payload.old?.channel_id;
          if (changedChannelId === channelId) {
            handlers.refreshAccess?.();
          }
        },
      );
    }

    realtimeChannel.subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [channelId, viewerId, handlers]);
};
