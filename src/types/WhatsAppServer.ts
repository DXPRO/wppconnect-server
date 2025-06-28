// import { Whatsapp } from '@wppconnect-team/wppconnect';
import * as puppeteer from 'puppeteer';

export interface WhatsAppServer {
  session: string;
  urlcode: string;
  status: string;
  // Adicione outros campos necessários usados pelo WA-JS
  page?: puppeteer.Page;
}
