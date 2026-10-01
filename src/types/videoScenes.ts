/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoScenePrompt {
  sceneNumber: number; // 1 to 5
  sceneTitle: string; // e.g. "Adegan 1: Hook Pembuka & Model Berbicara Langsung"
  duration: string; // e.g. "00:00 - 00:06 (6 Detik)"
  cameraAngle: string; // Sisi Kamera & Lensa (e.g. "Low-Angle Hero Shot, 35mm Anamorphic f/1.8")
  cameraMotion: string; // Gerakan Kamera (e.g. "Smooth Forward Tracking Dolly, 60fps Slow Motion")
  lightingMood: string; // Pencahayaan & Color Grade (e.g. "Warm Golden Hour Cinematic Sun Flare & Rim Light")
  visualAction: string; // Aksi Model, Interaksi Produk & Artikulasi Bibir Berbicara Langsung ke Kamera
  spokenDialogue?: string; // Naskah kalimat Selling Narrative yang diucapkan langsung oleh model ke kamera (Lip-Sync)
  aiPrompt: string; // Master prompt siap copy (sesuai rasio aktif)
  aiPrompt916?: string; // Master prompt khusus rasio vertikal 9:16 (TikTok, Reels, Shorts, Mobile TVC)
  aiPrompt169?: string; // Master prompt khusus rasio horizontal 16:9 (TV Commercial, Widescreen YouTube)
  audioCues?: string; // Efek suara & musik komersial TV (SFX & Music Cue)
}

export type AspectRatioType = '9:16' | '16:9';

export interface TvcVideoPackage {
  productTitle: string;
  theme: string;
  targetMarket: 'indonesia' | 'amazon';
  totalDuration: string;
  aspectRatio?: AspectRatioType;
  scenes: VideoScenePrompt[];
}
