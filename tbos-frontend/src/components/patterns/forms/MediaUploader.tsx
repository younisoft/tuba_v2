import { useId, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface LocalFile {
  id: string;
  name: string;
  status: 'uploading' | 'processing' | 'approved' | 'rejected';
  issue?: string;
}

export interface MediaUploaderProps {
  /** Called once a file's simulated upload+processing genuinely completes —
   * the caller persists it (e.g. propertiesApi.addMedia), matching WF-
   * PROPERTY-NEW's "media upload with real-time processing status." */
  onUploaded: (caption: string) => void;
  approvedCount: number;
}

/**
 * TBOS-PAT-FORM-003 — the File/Media Uploader pattern PROP-03/PROJ-03 both
 * need (tbos-blueprint/05_COMPONENT_MAPPING.md), never built until now
 * (confirmed by exhaustive search — PROP-02's Media tab is read-only
 * display only). No real upload backend exists — each file's progress is a
 * deterministic, explicitly-simulated local state machine (uploading →
 * processing → approved/rejected), never presented as a real network call.
 * A file whose name contains "fail" deterministically simulates the
 * `tbos-blueprint/17_ACCEPTANCE_CRITERIA.md` "Media upload fails mid-flow"
 * scenario — only that file shows a retry affordance, the rest of the flow
 * (other files, already-entered fields) is unaffected.
 */
export function MediaUploader({ onUploaded, approvedCount }: MediaUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [files, setFiles] = useState<LocalFile[]>([]);

  const runSimulation = (id: string, name: string) => {
    setTimeout(() => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'processing' } : f)));
      setTimeout(() => {
        const shouldFail = name.toLowerCase().includes('fail');
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: shouldFail ? 'rejected' : 'approved', issue: shouldFail ? t('mediaUploader.failIssue') : undefined } : f)));
        if (!shouldFail) onUploaded(name);
      }, 250);
    }, 250);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      const id = `mu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setFiles((prev) => [...prev, { id, name: file.name, status: 'uploading' }]);
      runSimulation(id, file.name);
    });
    if (inputRef.current) inputRef.current.value = '';
  };

  const retry = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (!file) return;
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'uploading', issue: undefined } : f)));
    runSimulation(id, file.name.replace(/fail/i, 'retry'));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center">
        <Icon name="upload" className="h-6 w-6 text-icon-muted" />
        <p className="text-body text-text-secondary">{t('mediaUploader.hint')}</p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/*"
          aria-label={t('mediaUploader.selectFiles')}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          {t('mediaUploader.selectFiles')}
        </Button>
        <p className="text-caption text-text-muted">
          {approvedCount} {t('mediaUploader.approvedSuffix')}
        </p>
      </div>
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
              <span className="min-w-0 flex-1 truncate text-body text-text-primary">{f.name}</span>
              {(f.status === 'uploading' || f.status === 'processing') && (
                <span className="text-caption text-text-muted">{f.status === 'uploading' ? t('mediaUploader.uploading') : t('mediaUploader.processing')}</span>
              )}
              {f.status === 'approved' && <Badge tone="success">{t('mediaUploader.approved')}</Badge>}
              {f.status === 'rejected' && (
                <div className="flex items-center gap-2">
                  <span className="text-caption text-text-danger">{f.issue}</span>
                  <Button size="sm" variant="secondary" onClick={() => retry(f.id)}>
                    {t('mediaUploader.retry')}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
