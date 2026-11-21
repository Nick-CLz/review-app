"use client";

// Camera barcode scanner (ZXing, loaded only when needed). Works in iOS Safari and Android Chrome.
// Cameras need HTTPS or localhost. A photo upload and a typed barcode are always available as fallbacks.

import { useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import { checkDigitOk } from "@/lib/barcode";
import { useT } from "@/lib/i18n";

async function makeReader() {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints);
}

const VALID = /^\d{6,14}$/;

export function BarcodeScanner({ onCode }: { onCode: (code: string) => void }) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  // Bumped whenever the camera is stopped, so a start that is still in flight knows to give up
  const run = useRef(0);
  const [state, setState] = useState<"idle" | "starting" | "scanning">("idle");
  const [err, setErr] = useState("");
  const [typed, setTyped] = useState("");

  const stop = () => {
    run.current++;
    controls.current?.stop();
    controls.current = null;
    setState("idle");
  };

  useEffect(
    () => () => {
      run.current++;
      controls.current?.stop();
    },
    [],
  );

  async function start() {
    setErr("");
    setState("starting");
    const id = ++run.current;
    try {
      const reader = await makeReader();
      let done = false;
      const ctl = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        video.current!,
        (result, _error, ctl) => {
          const text = result?.getText();
          if (done || !text || !VALID.test(text)) return;
          done = true;
          run.current++;
          ctl.stop();
          controls.current = null;
          setState("idle");
          navigator.vibrate?.(60);
          onCode(text);
        },
      );
      // Stopped, left the page, or already read a code while the camera was still starting
      if (run.current !== id) return ctl.stop();
      controls.current = ctl;
      setState("scanning");
    } catch (e) {
      if (run.current !== id) return;
      controls.current = null;
      setState("idle");
      const name = (e as Error).name;
      setErr(name === "NotAllowedError" || name === "SecurityError" ? t("scan.denied") : name === "NotFoundError" || name === "OverconstrainedError" ? t("scan.noCamera") : t("scan.cameraFail"));
    }
  }

  async function fromFile(file: File) {
    setErr("");
    const url = URL.createObjectURL(file);
    try {
      const reader = await makeReader();
      const text = (await reader.decodeFromImageUrl(url)).getText();
      if (!VALID.test(text)) throw new Error("not a product barcode");
      onCode(text);
    } catch {
      setErr(t("scan.noBarcodeInPhoto"));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-xl bg-zinc-900 ${state === "idle" ? "hidden" : ""}`}>
        <video ref={video} className="aspect-[4/3] w-full object-cover" muted playsInline />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-1/3 w-3/4 rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
        <p className="absolute inset-x-0 bottom-2 text-center text-sm text-white drop-shadow">{state === "starting" ? t("scan.starting") : t("scan.aim")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {state === "idle" ? (
          <button type="button" className="btn-primary px-5 py-3 text-base" onClick={start}>
            📷 {t("scan.start")}
          </button>
        ) : (
          <button type="button" className="btn-ghost px-5 py-3 text-base" onClick={stop}>
            {t("scan.stop")}
          </button>
        )}
        <label className="btn-ghost cursor-pointer px-5 py-3 text-base">
          🖼️ {t("scan.photo")}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) fromFile(f);
            }}
          />
        </label>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const code = typed.replace(/\D/g, "");
          if (!VALID.test(code)) return setErr(t("scan.invalid"));
          if (!checkDigitOk(code)) return setErr(t("scan.badCheck"));
          setErr("");
          onCode(code);
        }}
      >
        <input className="input" inputMode="numeric" placeholder={t("scan.manual")} aria-label={t("scan.manual")} value={typed} onChange={(e) => setTyped(e.target.value)} />
        <button className="btn-ghost shrink-0">{t("scan.lookup")}</button>
      </form>

      {err && <p className="text-sm text-amber-600" role="alert">{err}</p>}
    </div>
  );
}
