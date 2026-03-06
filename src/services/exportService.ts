/**
 * Export Service — generates a "Gallery Guide" PDF from an AuraPlan.
 * Layout: A4, 12-column grid, one activity per card with hero image.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AuraPlan, DayPlan, Activity } from '../types';
import { minutesToTime } from '../utils/travelTime';
import { VIBE_CONFIGS } from '../utils/vibeConfig';

function activityCard(activity: Activity, index: number): string {
  const time = activity.startTime !== undefined ? minutesToTime(activity.startTime) : '';
  return `
    <div class="activity-card">
      <div class="card-image-wrapper">
        <img class="card-image" src="${activity.imageUrl}" alt="${activity.title}" onerror="this.style.background='#1E1E2E'"/>
        <div class="card-image-overlay"></div>
        <span class="card-time">${time}</span>
      </div>
      <div class="card-body">
        <p class="card-hook">${activity.poeticHook.toUpperCase()}</p>
        <h3 class="card-title">${activity.title}</h3>
        <p class="card-district">${activity.district} · ${activity.duration} min</p>
        ${activity.needToKnows.length > 0
          ? `<ul class="card-notes">${activity.needToKnows.map((n) => `<li>${n}</li>`).join('')}</ul>`
          : ''
        }
        ${activity.bookingUrl ? `<p class="card-booking">Book: ${activity.bookingUrl}</p>` : ''}
      </div>
    </div>
  `;
}

function daySection(day: DayPlan): string {
  const orderedActivities = [...day.activities].sort(
    (a, b) => (a.startTime ?? 0) - (b.startTime ?? 0)
  );
  return `
    <div class="day-section">
      <div class="day-header">
        <h2 class="day-label">DAY ${day.day}</h2>
        <span class="day-date">${day.date}</span>
      </div>
      <div class="cards-grid">
        ${orderedActivities.map(activityCard).join('')}
      </div>
    </div>
  `;
}

function buildHtml(plan: AuraPlan): string {
  const vibe = VIBE_CONFIGS[plan.vibe];
  const days = plan.days.map(daySection).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 20mm 15mm; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      background: #F0F0F8;
      color: #0A0A0F;
    }

    /* Cover */
    .cover {
      width: 100%;
      min-height: 200px;
      background: linear-gradient(135deg, ${vibe.colorSecondary}, ${vibe.colorPrimary});
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 32px;
      margin-bottom: 32px;
      border-radius: 12px;
      color: white;
    }
    .cover-vibe { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; opacity: 0.7; margin-bottom: 8px; }
    .cover-destination { font-size: 42px; font-weight: 200; letter-spacing: -1px; line-height: 1.1; }
    .cover-duration { font-size: 13px; letter-spacing: 2px; opacity: 0.8; margin-top: 8px; }

    /* Day section */
    .day-section { margin-bottom: 40px; }
    .day-header {
      display: flex;
      align-items: baseline;
      gap: 16px;
      border-bottom: 1px solid rgba(10,10,15,0.15);
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .day-label { font-size: 10px; letter-spacing: 4px; font-weight: 600; }
    .day-date { font-size: 12px; opacity: 0.5; }

    /* 12-column card grid (3 per row) */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .activity-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      break-inside: avoid;
    }

    .card-image-wrapper {
      position: relative;
      width: 100%;
      height: 120px;
      background: #1E1E2E;
      overflow: hidden;
    }
    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
    }
    .card-time {
      position: absolute;
      bottom: 8px;
      right: 10px;
      font-size: 10px;
      color: white;
      letter-spacing: 1px;
    }

    .card-body { padding: 12px; }
    .card-hook {
      font-size: 8px;
      letter-spacing: 3px;
      color: ${vibe.colorPrimary};
      margin-bottom: 4px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.3px;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .card-district {
      font-size: 10px;
      opacity: 0.5;
      margin-bottom: 8px;
    }
    .card-notes {
      list-style: none;
      font-size: 9px;
      line-height: 1.6;
      opacity: 0.7;
    }
    .card-notes li::before { content: '— '; }
    .card-booking {
      font-size: 8px;
      margin-top: 6px;
      color: ${vibe.colorPrimary};
      word-break: break-all;
    }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 9px;
      letter-spacing: 2px;
      opacity: 0.3;
      padding-top: 20px;
      margin-top: 20px;
      border-top: 1px solid rgba(10,10,15,0.1);
    }
  </style>
</head>
<body>
  <div class="cover">
    <p class="cover-vibe">${vibe.label} · Aura</p>
    <h1 class="cover-destination">${plan.destination}</h1>
    <p class="cover-duration">${plan.duration} ${plan.duration === 1 ? 'day' : 'days'} · ${new Date(plan.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
  </div>
  ${days}
  <div class="footer">AURA · YOUR GALLERY GUIDE</div>
</body>
</html>
  `.trim();
}

export async function exportPlanToPDF(plan: AuraPlan): Promise<void> {
  const html = buildHtml(plan);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Aura — ${plan.destination}`,
      UTI: 'com.adobe.pdf',
    });
  }
}
