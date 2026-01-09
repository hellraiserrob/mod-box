import { ref, onUnmounted, type Ref } from 'vue';

/**
 * Composable for handling dropdown/modal outside click behavior
 * Provides toggle, open, close functions and isOpen state with automatic cleanup
 */
export function useOutsideClick(rootRef: Ref<HTMLElement | null>) {
  const isOpen = ref(false);

  function outsideClick(e: MouseEvent) {
    if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
      close();
    }
  }

  function open() {
    isOpen.value = true;
    window.addEventListener('click', outsideClick);
  }

  function close() {
    isOpen.value = false;
    window.removeEventListener('click', outsideClick);
  }

  function toggle() {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('click', outsideClick);
  });

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

