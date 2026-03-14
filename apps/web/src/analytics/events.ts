export const ANALYTICS_EVENTS = {
  pageViewed: "page_viewed",
  authLoginAttempt: "auth_login_attempt",
  authLoginSuccess: "auth_login_success",
  authLoginFailed: "auth_login_failed",
  authRegisterAttempt: "auth_register_attempt",
  authRegisterSuccess: "auth_register_success",
  authRegisterFailed: "auth_register_failed",
  authResendConfirmationAttempt: "auth_resend_confirmation_attempt",
  authResendConfirmationSuccess: "auth_resend_confirmation_success",
  authResendConfirmationFailed: "auth_resend_confirmation_failed",
  authResetPasswordAttempt: "auth_reset_password_attempt",
  authResetPasswordSuccess: "auth_reset_password_success",
  authResetPasswordFailed: "auth_reset_password_failed",
  authLogout: "auth_logout",

  missionDiscoveryViewed: "mission_discovery_viewed",
  missionFiltersApplied: "mission_filters_applied",
  missionDiscoveryEmptyResults: "mission_discovery_empty_results",
  missionCardClicked: "mission_card_clicked",

  applicationAttempt: "application_attempt",
  applicationSuccess: "application_success",
  applicationFailed: "application_failed",

  missionCreateStepViewed: "mission_create_step_viewed",
  missionCreateValidationFailed: "mission_create_validation_failed",
  missionCreateAttempt: "mission_create_attempt",
  missionCreateSuccess: "mission_create_success",
  missionCreateFailed: "mission_create_failed",

  messagingConversationOpened: "messaging_conversation_opened",
  messagingMessageSendSuccess: "messaging_message_send_success",
  messagingMessageSendFailed: "messaging_message_send_failed",
  messagingConversationDeleteSuccess: "messaging_conversation_delete_success",
  messagingConversationDeleteFailed: "messaging_conversation_delete_failed",

  paymentCheckoutStarted: "payment_checkout_started",
  paymentCheckoutRedirected: "payment_checkout_redirected",
  paymentCheckoutFailed: "payment_checkout_failed",
  paymentReturnSuccess: "payment_return_success",
  paymentReturnCancelled: "payment_return_cancelled",

  apiRequestSuccess: "api_request_success",
  apiRequestFailed: "api_request_failed",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;
