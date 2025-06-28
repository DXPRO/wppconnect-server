declare global {
  interface Window {
    WPP: {
      isReady: boolean;
      webpack: any;
      whatsapp: any;
      chat: {
        getAllUnreadMessages: () => Promise<any[]>;
        getChat: (chatId: string) => Promise<any>;
        sendTextMessage: (to: string, message: string) => Promise<any>;
        sendImageMessage: (
          to: string,
          image: string,
          caption?: string
        ) => Promise<any>;
        sendVideoMessage: (
          to: string,
          video: string,
          caption?: string
        ) => Promise<any>;
        sendFileMessage: (
          to: string,
          file: string,
          caption?: string
        ) => Promise<any>;
        sendAudioMessage: (to: string, audio: string) => Promise<any>;
        deleteMessage: (chatId: string, messageId: string) => Promise<any>;
        list: () => Promise<any[]>;
        on: (event: string, callback: (data: any) => void) => void;
      };
      contact: {
        getContact: (contactId: string) => Promise<any>;
        getAllContacts: () => Promise<any[]>;
        blockContact: (contactId: string) => Promise<any>;
        unblockContact: (contactId: string) => Promise<any>;
      };
      group: {
        createGroup: (name: string, participants: string[]) => Promise<any>;
        addParticipant: (
          groupId: string,
          participantId: string
        ) => Promise<any>;
        removeParticipant: (
          groupId: string,
          participantId: string
        ) => Promise<any>;
        promoteParticipant: (
          groupId: string,
          participantId: string
        ) => Promise<any>;
        demoteParticipant: (
          groupId: string,
          participantId: string
        ) => Promise<any>;
        getGroupInfoFromInviteCode: (inviteCode: string) => Promise<any>;
      };
      conn: {
        isAuthenticated: () => boolean;
        logout: () => Promise<any>;
        on: (event: string, callback: (data: any) => void) => void;
        getAuthCode?: () => any;
        getQrCode?: () => any;
      };
    };
  }
}

export {};
