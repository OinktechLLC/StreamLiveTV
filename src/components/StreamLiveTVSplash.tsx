import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const SPLASH_DURATION_SECONDS = 50;

const StreamLiveTVSplash = () => {
  const [secondsLeft, setSecondsLeft] = useState(SPLASH_DURATION_SECONDS);
  const [isClosed, setIsClosed] = useState(false);
  const location = useLocation();

  const isHiddenRoute = useMemo(
    () => ["/embed/", "/popout/"].some((prefix) => location.pathname.startsWith(prefix)),
    [location.pathname],
  );

  useEffect(() => {
    if (isHiddenRoute || isClosed || secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isClosed, isHiddenRoute, secondsLeft]);

  if (isClosed || isHiddenRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 text-white">
      <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-zinc-900 p-6 shadow-2xl md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">StreamLiveTV Tutorial</p>
        <h2 className="mt-3 text-2xl font-bold md:text-4xl">Как создать канал или радио в StreamLiveTV</h2>
        <p className="mt-4 text-sm text-zinc-200 md:text-base">
          В этом обучающем экране показано, как запустить собственный канал, добавить радио-поток, оформить страницу и
          привлекать зрителей через короткие видео и рекомендации — по аналогии с тем, как работает TikTok.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-zinc-300 md:text-base">
          <li>• Шаг 1: Создайте канал и заполните профиль.</li>
          <li>• Шаг 2: Подключите видео или радио-источник.</li>
          <li>• Шаг 3: Настройте обложки, описание и правила чата.</li>
          <li>• Шаг 4: Публикуйте клипы и продвигайте канал в Shorts.</li>
        </ul>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400 md:text-sm">
            Кнопка закрытия станет доступна через <span className="font-semibold text-emerald-300">{secondsLeft}</span>{" "}
            сек.
          </p>
          <button
            type="button"
            disabled={secondsLeft > 0}
            onClick={() => setIsClosed(true)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamLiveTVSplash;
