# Rotas Disponíveis no Projeto (WA-JS)

> **Atenção:** Esta lista foi extraída do arquivo de rotas do projeto. Use como referência para ajustar e garantir que todas funcionem corretamente com WA-JS puro.

---

## Autenticação e Sessão

- POST `/api/:session/:secretkey/generate-token`
- GET `/api/:session/:secretkey/apply-token`
- GET `/api/:session/:secretkey/apply-token-auto`
- GET `/api/:secretkey/show-all-sessions`
- POST `/api/:secretkey/start-all`
- POST `/api/:session/start-session`
- POST `/api/:session/logout-session`
- POST `/api/:session/close-session`
- POST `/api/:session/:secretkey/clear-session-data`
- GET `/api/:session/check-connection-session`
- GET `/api/:session/qrcode-session`

## Mensagens

- POST `/api/:session/send-message`
- POST `/api/:session/edit-message`
- POST `/api/:session/send-image`
- POST `/api/:session/send-sticker`
- POST `/api/:session/send-sticker-gif`
- POST `/api/:session/send-reply`
- POST `/api/:session/send-file`
- POST `/api/:session/send-file-base64`
- POST `/api/:session/send-voice`
- POST `/api/:session/send-voice-base64`
- POST `/api/:session/send-status`
- POST `/api/:session/send-link-preview`
- POST `/api/:session/send-location`
- POST `/api/:session/send-mentioned`
- POST `/api/:session/send-buttons`
- POST `/api/:session/send-list-message`
- POST `/api/:session/send-order-message`
- POST `/api/:session/send-poll-message`

## Grupos

- GET `/api/:session/all-broadcast-list`
- GET `/api/:session/all-groups`
- GET `/api/:session/group-members/:groupId`
- GET `/api/:session/common-groups/:wid`
- GET `/api/:session/group-admins/:groupId`
- GET `/api/:session/group-invite-link/:groupId`
- GET `/api/:session/group-revoke-link/:groupId`
- GET `/api/:session/group-members-ids/:groupId`
- POST `/api/:session/create-group`
- POST `/api/:session/leave-group`
- POST `/api/:session/join-code`
- POST `/api/:session/add-participant-group`
- POST `/api/:session/remove-participant-group`
- POST `/api/:session/promote-participant-group`
- POST `/api/:session/demote-participant-group`
- POST `/api/:session/group-info-from-invite-link`
- POST `/api/:session/group-description`
- POST `/api/:session/group-property`
- POST `/api/:session/group-subject`
- POST `/api/:session/messages-admins-only`
- POST `/api/:session/group-pic`
- POST `/api/:session/change-privacy-group`

## Chats

- GET `/api/:session/all-chats`
- POST `/api/:session/list-chats`
- GET `/api/:session/all-chats-archived`
- GET `/api/:session/all-chats-with-messages`
- GET `/api/:session/all-messages-in-chat/:phone`
- GET `/api/:session/all-new-messages`
- GET `/api/:session/unread-messages`
- GET `/api/:session/all-unread-messages`
- GET `/api/:session/chat-by-id/:phone`
- GET `/api/:session/message-by-id/:messageId`
- GET `/api/:session/chat-is-online/:phone`
- GET `/api/:session/last-seen/:phone`
- GET `/api/:session/list-mutes/:type`
- GET `/api/:session/load-messages-in-chat/:phone`
- GET `/api/:session/get-messages/:phone`
- POST `/api/:session/archive-chat`
- POST `/api/:session/archive-all-chats`
- POST `/api/:session/clear-chat`
- POST `/api/:session/clear-all-chats`
- POST `/api/:session/delete-chat`
- POST `/api/:session/delete-all-chats`
- POST `/api/:session/delete-message`
- POST `/api/:session/react-message`
- POST `/api/:session/forward-messages`
- POST `/api/:session/mark-unseen`
- POST `/api/:session/pin-chat`
- POST `/api/:session/contact-vcard`
- POST `/api/:session/send-mute`
- POST `/api/:session/send-seen`
- POST `/api/:session/chat-state`
- POST `/api/:session/temporary-messages`
- POST `/api/:session/typing`
- POST `/api/:session/recording`
- POST `/api/:session/star-message`
- GET `/api/:session/reactions/:id`
- GET `/api/:session/votes/:id`
- POST `/api/:session/reject-call`

## Catálogo/Produtos

- GET `/api/:session/get-products`
- GET `/api/:session/get-product-by-id`
- POST `/api/:session/add-product`
- POST `/api/:session/edit-product`
- POST `/api/:session/del-products`
- POST `/api/:session/change-product-image`
- POST `/api/:session/add-product-image`
- POST `/api/:session/remove-product-image`
- GET `/api/:session/get-collections`
- POST `/api/:session/create-collection`
- POST `/api/:session/edit-collection`
- POST `/api/:session/del-collection`
- POST `/api/:session/send-link-catalog`
- POST `/api/:session/set-product-visibility`
- POST `/api/:session/set-cart-enabled`

## Status

- POST `/api/:session/send-text-storie`
- POST `/api/:session/send-image-storie`
- POST `/api/:session/send-video-storie`

## Labels

- POST `/api/:session/add-new-label`
- POST `/api/:session/add-or-remove-label`
- GET `/api/:session/get-all-labels`
- PUT `/api/:session/delete-all-labels`
- PUT `/api/:session/delete-label/:id`

## Contatos

- GET `/api/:session/check-number-status/:phone`
- GET `/api/:session/all-contacts`
- GET `/api/:session/contact/:phone`
- GET `/api/:session/profile/:phone`
- GET `/api/:session/profile-pic/:phone`
- GET `/api/:session/profile-status/:phone`
- GET `/api/:session/blocklist`
- POST `/api/:session/block-contact`
- POST `/api/:session/unblock-contact`

## Device/Profile

- GET `/api/:session/get-battery-level`
- GET `/api/:session/host-device`
- GET `/api/:session/get-phone-number`
- POST `/api/:session/set-profile-pic`
- POST `/api/:session/profile-status`
- POST `/api/:session/change-username`
- POST `/api/:session/edit-business-profile`
- GET `/api/:session/get-business-profiles-products`
- GET `/api/:session/get-order-by-messageId/:messageId`

## Utilitários/Admin

- GET `/api/:secretkey/backup-sessions`
- POST `/api/:secretkey/restore-sessions`
- GET `/api/:session/take-screenshot`
- POST `/api/:session/set-limit`
- POST `/api/:session/clean-session`
- POST `/api/:session/execute-script`
- POST `/api/:session/generate-link-device-code`

## Comunidades/Newsletter

- POST `/api/:session/create-community`
- POST `/api/:session/deactivate-community`
- POST `/api/:session/add-community-subgroup`
- POST `/api/:session/remove-community-subgroup`
- POST `/api/:session/promote-community-participant`
- POST `/api/:session/demote-community-participant`
- GET `/api/:session/community-participants/:id`
- POST `/api/:session/newsletter`
- PUT `/api/:session/newsletter/:id`
- DELETE `/api/:session/newsletter/:id`
- POST `/api/:session/mute-newsletter/:id`

## Outros

- GET `/api-docs`
- GET `/healthz`
- GET `/unhealthy`
- GET `/metrics`
- GET `/api/sessions`
- DELETE `/api/sessions/:session`
- DELETE `/api/sessions`
- POST `/api/sessions/:session`
