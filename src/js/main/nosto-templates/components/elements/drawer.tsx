import React, { useCallback, useRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { get, getAll } from "../../../../utils";
import { useAppState } from "../../contexts/app-state";
import { rcn } from "../../tools/react-class-name";
import Icon from "./icon";

type Props = {
  className?: string;
  direction: "left" | "right";
  title: string;
  additionalTitleContent: ReactNode;
  accessibilityTitle: string;
  accessibilityDescription: string;
  main: React.ReactNode;
  footer?: React.ReactNode;
};

const Drawer: React.FC<Props> = ({
  className,
  direction,
  title,
  additionalTitleContent,
  accessibilityTitle,
  accessibilityDescription,
  main,
  footer,
}) => {
  const { mobileFacetsDrawerState, toggleMobileFacetsDrawerState } =
    useAppState();
  const dialog = useRef<HTMLElement | null>(null);

  const handleDialogClose = useCallback(
    (close: boolean) => {
      if (close && dialog.current) {
        dialog.current.classList.add("is-hiding");

        setTimeout(() => {
          toggleMobileFacetsDrawerState(false);
        }, 300);
      }
    },
    [toggleMobileFacetsDrawerState],
  );

  const initialise = (e: Event) => {
    const open = mobileFacetsDrawerState;
    dialog.current = e.target as HTMLElement | null;

    if (open && dialog.current) {
      // Header Sizing
      const headerEl = get(
        '[data-dialog-element="header"]',
        dialog.current,
      ) as HTMLElement | null;
      if (headerEl) {
        const headerResizeObserver = new ResizeObserver(() => {
          dialog.current?.style.setProperty(
            "--dialog-drawer-header-height",
            `${headerEl.clientHeight}px`,
          );
        });
        headerResizeObserver.observe(headerEl);
      }

      // Footer Sizing
      const footerEl = get(
        '[data-dialog-element="footer"]',
        dialog.current,
      ) as HTMLElement | null;
      if (footerEl) {
        const footerResizeObserver = new ResizeObserver(() => {
          dialog.current?.style.setProperty(
            "--dialog-drawer-footer-height",
            `${footerEl.clientHeight}px`,
          );
        });
        footerResizeObserver.observe(footerEl);
      }

      // Apply Close Listeners
      if (headerEl) {
        const headerCloseTriggers = getAll(
          '[data-dialog-element="close"]',
          headerEl,
        );

        for (const trigger of headerCloseTriggers) {
          trigger.addEventListener("click", () => {
            handleDialogClose(true);
          });
        }
      }

      if (footerEl) {
        const footerCloseTriggers = getAll(
          '[data-dialog-element="close"]',
          footerEl,
        );
        for (const trigger of footerCloseTriggers) {
          trigger.addEventListener("click", () => {
            handleDialogClose(true);
          });
        }
      }
    }
  };

  return (
    <Dialog.Root open={mobileFacetsDrawerState}>
      <Dialog.Portal>
        <Dialog.Content
          className={`dialog dialog--drawer dialog--drawer-${direction}${rcn(className)}`}
          onOpenAutoFocus={initialise}
          aria-hidden={!mobileFacetsDrawerState}
          aria-modal="false"
          role="dialog"
        >
          <Dialog.Overlay
            className="dialog-overlay"
            onClick={() => {
              handleDialogClose(true);
            }}
          />

          <div role="document">
            <header data-dialog-element="header">
              <div className="flex items-center justify-between gap-x-3">
                <div className="flex items-center gap-x-4">
                  <Dialog.Title asChild>
                    <h3 className="flex items-center gap-x-2 text-xs font-semibold tracking-standard">
                      {title}
                    </h3>
                  </Dialog.Title>

                  {additionalTitleContent}
                </div>

                <button
                  className="aspect-square w-6 fill-black stroke-2"
                  aria-label={window.Shopify.theme.i18n.global.dialogs.accessibility.actions.close.replace(
                    "{{ dialog }}",
                    accessibilityTitle,
                  )}
                  data-dialog-element="close"
                  data-a11y-dialog-hide
                >
                  <Icon name="close" />
                </button>
              </div>
            </header>

            <div data-dialog-element="main">
              <VisuallyHidden.Root>
                <Dialog.Description>
                  {accessibilityDescription}
                </Dialog.Description>
              </VisuallyHidden.Root>

              {main}
            </div>

            {footer && <footer data-dialog-element="footer">{footer}</footer>}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Drawer;
