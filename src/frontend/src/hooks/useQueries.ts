import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  ChatMessage,
  Doubt,
  Event,
  Stats,
  StudyPost,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  stats: ["stats"],
  studyPosts: ["studyPosts"],
  doubts: ["doubts"],
  events: ["events"],
  announcements: ["announcements"],
  chatMessages: ["chatMessages"],
  myProfile: ["myProfile"],
  isAdmin: ["isAdmin"],
} as const;

// ─── Read Queries ─────────────────────────────────────────────────────────────

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      if (!actor)
        return {
          eventCount: 0n,
          doubtCount: 0n,
          userCount: 0n,
          announcementCount: 0n,
          studyPostCount: 0n,
        } as Stats;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudyPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<StudyPost[]>({
    queryKey: QUERY_KEYS.studyPosts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudyPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDoubts() {
  const { actor, isFetching } = useActor();
  return useQuery<Doubt[]>({
    queryKey: QUERY_KEYS.doubts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDoubts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: QUERY_KEYS.events,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: QUERY_KEYS.announcements,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetChatMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: QUERY_KEYS.chatMessages,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: QUERY_KEYS.myProfile,
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getMyProfile();
      return result ?? null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: QUERY_KEYS.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateStudyPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      subjectTag,
    }: { title: string; content: string; subjectTag: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createStudyPost(title, content, subjectTag);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyPosts });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useLikeStudyPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.likeStudyPost(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studyPosts });
    },
  });
}

export function useCreateDoubt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      subjectTag,
    }: { title: string; content: string; subjectTag: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createDoubt(title, content, subjectTag);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doubts });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doubtId,
      content,
    }: { doubtId: bigint; content: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addComment(doubtId, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doubts });
    },
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      eventDate,
    }: { title: string; description: string; eventDate: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createEvent(title, description, eventDate);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: { title: string; content: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createAnnouncement(title, content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.announcements,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.sendChatMessage(content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chatMessages });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
    }: { displayName: string; bio: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateProfile(displayName, bio);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.myProfile });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.isAdmin });
      void queryClient.refetchQueries({ queryKey: QUERY_KEYS.isAdmin });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
}
