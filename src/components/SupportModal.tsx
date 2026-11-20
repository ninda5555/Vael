import React from 'react';
import { Phone, ShieldCheck } from 'lucide-react';
import type { TranslationStrings } from '../../shared/i18n.ts';
import { SUPPORT_RESOURCES } from '../../shared/policy.ts';
import { BottomSheet } from './BottomSheet.tsx';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
  strings: TranslationStrings;
}

export const SupportModal: React.FC<SupportModalProps> = ({ open, onClose, strings }) => {
  return (
    <BottomSheet open={open} onClose={onClose} title={strings.support.title} closeLabel={strings.support.closeBtn}>
      <div className="space-y-4">
        <p className="text-[15px] leading-[22px] text-[#59595F] dark:text-[#B3B4B1]">
          {strings.support.gentleMessage}
        </p>

        <div className="rounded-[14px] bg-[#F3F3F5] dark:bg-[#151617] p-3.5 text-[13px] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#A63A32] dark:text-[#E07A73]" />
          <span>{strings.support.savePreservedNote}</span>
        </div>

        <div className="space-y-2.5">
          {SUPPORT_RESOURCES.map((res) => (
            <div
              key={res.id}
              className="rounded-[14px] border border-[#DADADD] dark:border-[#363839] p-4 space-y-1.5"
            >
              <div className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">
                {res.region} · {strings.support.verifiedLabel} {res.verifiedDate}
              </div>
              <div className="text-[15px] font-medium">{res.name}</div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#A63A32] dark:text-[#E07A73] tabular-nums">
                  <Phone className="w-4 h-4" />
                  {res.contact}
                </span>
                <span className="text-[12px] text-[#59595F] dark:text-[#B3B4B1]">{res.hours}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="pressable w-full min-h-[48px] rounded-[12px] bg-[#19191B] text-[#FFFFFF] dark:bg-[#EEEAE2] dark:text-[#1A1B1C] text-[15px] font-medium"
        >
          {strings.support.closeBtn}
        </button>
      </div>
    </BottomSheet>
  );
};
