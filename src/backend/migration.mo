import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  // Type Definitions for Old Actor (without getAllUserProfiles)
  type UserProfile = {
    displayName : Text;
    bio : Text;
    role : Text;
  };

  type StudyPost = {
    id : Nat;
    author : Principal;
    authorName : Text;
    title : Text;
    content : Text;
    subjectTag : Text;
    likes : [Principal];
    timestamp : Int;
  };

  type Doubt = {
    id : Nat;
    author : Principal;
    authorName : Text;
    title : Text;
    content : Text;
    subjectTag : Text;
    comments : [Comment];
    timestamp : Int;
  };

  type Comment = {
    author : Principal;
    authorName : Text;
    content : Text;
    timestamp : Int;
  };

  type Event = {
    id : Nat;
    title : Text;
    description : Text;
    eventDate : Int;
    createdBy : Principal;
    timestamp : Int;
  };

  type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    createdBy : Principal;
    timestamp : Int;
  };

  type ChatMessage = {
    id : Nat;
    author : Principal;
    authorName : Text;
    content : Text;
    timestamp : Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    studyPosts : Map.Map<Nat, StudyPost>;
    doubts : Map.Map<Nat, Doubt>;
    events : Map.Map<Nat, Event>;
    announcements : Map.Map<Nat, Announcement>;
    chatMessages : Map.Map<Nat, ChatMessage>;
    nextStudyPostId : Nat;
    nextDoubtId : Nat;
    nextEventId : Nat;
    nextAnnouncementId : Nat;
    nextChatMessageId : Nat;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    // No data structure changes needed for this migration
    old;
  };
};
