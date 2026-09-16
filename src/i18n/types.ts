import enMessages from "../../messages/en.json";

type Messages = typeof enMessages;

declare global {
  // This interface deliberately augments next-intl's generated message shape.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}
}

export {};
