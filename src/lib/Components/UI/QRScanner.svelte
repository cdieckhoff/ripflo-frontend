<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { toastStore } from '../../stores/toastStore';

  let { onScan = null, onCancel = null } = $props<{
    onScan?: ((code: string) => void) | null;
    onCancel?: (() => void) | null;
  }>();

  let scannerContainerId = $state(`qr-scanner-${Date.now()}`);
  let html5Qrcode: any = null;
  let isScanning = $state(false);
  let cameraError = $state('');
  let zoom = $state(1);
  let torchOn = $state(false);
  let cameras: any[] = $state([]);
  let selectedCameraId = $state('');

  async function startScanner(cameraId: string) {
    if (!html5Qrcode || !cameraId) return;

    try {
      await html5Qrcode.start(
        { deviceId: cameraId },
        {
          fps: 10,
          qrbox: { width: 150, height: 80 },
          disableFlip: false
        },
        (decodedText: string) => {
          if (onScan) onScan(decodedText);
          stopScanning(false);
        },
        (errorMessage: string) => {
          // Ignore scan errors
        }
      );
      isScanning = true;
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      cameraError = getCameraErrorMessage(err);
      toastStore.add({ message: cameraError, type: 'error' });
      isScanning = false;
    }
  }

  async function initScanner() {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      // Wait for DOM element
      await new Promise(resolve => {
        const check = () => {
          if (document.getElementById(scannerContainerId)) {
            resolve(true);
          } else {
            setTimeout(check, 50);
          }
        };
        check();
      });

      html5Qrcode = new Html5Qrcode(scannerContainerId);
      cameras = await Html5Qrcode.getCameras();

      if (cameras.length === 0) {
        cameraError = 'No cameras found.';
        toastStore.add({ message: cameraError, type: 'error' });
        return;
      }

      // Select back camera on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      let cameraId = cameras[0].id;

      if (isMobile && cameras.length > 1) {
        const backCamera = cameras.find(c =>
          c.label.toLowerCase().includes('back') ||
          c.label.toLowerCase().includes('rear') ||
          c.label.toLowerCase().includes('environment')
        );
        cameraId = backCamera ? backCamera.id : cameras[cameras.length - 1].id;
      }

      selectedCameraId = cameraId;
      await startScanner(cameraId);
    } catch (err: any) {
      console.error("Init error:", err);
      cameraError = getCameraErrorMessage(err);
      toastStore.add({ message: cameraError, type: 'error' });
    }
  }

  onMount(() => {
    initScanner();
  });

  function getCameraErrorMessage(err: any): string {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'Camera permission denied.';
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'No camera found.';
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return 'Camera is in use.';
    }
    return 'Camera error: ' + err.message;
  }

  async function setZoom(value: number) {
    zoom = value;
    if (html5Qrcode && isScanning) {
      try {
        await html5Qrcode.applyVideoConstraints({ advanced: [{ zoom: value }] });
      } catch (err) {
        console.error('Zoom error:', err);
      }
    }
  }

  async function toggleTorch() {
    torchOn = !torchOn;
    if (html5Qrcode && isScanning) {
      try {
        await html5Qrcode.applyVideoConstraints({ advanced: [{ torch: torchOn }] });
      } catch (err) {
        torchOn = false;
      }
    }
  }

  async function selectCamera(cameraId: string) {
    if (cameraId === selectedCameraId) return;

    selectedCameraId = cameraId;

    if (html5Qrcode && isScanning) {
      await html5Qrcode.stop();
      isScanning = false;
    }

    // Reinitialize with new camera
    const { Html5Qrcode } = await import('html5-qrcode');
    const container = document.getElementById(scannerContainerId);
    if (container) container.innerHTML = '';

    html5Qrcode = new Html5Qrcode(scannerContainerId);
    await startScanner(cameraId);
  }

  async function stopScanning(close = true) {
    if (html5Qrcode && isScanning) {
      await html5Qrcode.stop();
      isScanning = false;
    }
    // Clear the container to release the video element
    const container = document.getElementById(scannerContainerId);
    if (container) container.innerHTML = '';
    
    if (close && onCancel) onCancel();
  }

  onDestroy(async () => {
    if (html5Qrcode && isScanning) {
      await html5Qrcode.stop();
      isScanning = false;
    }
    // Clear the container to release the video element
    const container = document.getElementById(scannerContainerId);
    if (container) container.innerHTML = '';
  });
</script>

<div class="qr-scanner-component">
  <div class="scanner-container mb-3">
    {#if cameraError}
      <div class="alert alert-danger mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Camera Error:</strong> {cameraError}
      </div>
    {/if}

    <div id={scannerContainerId} class="qr-scanner-container"></div>

    <div class="scanner-controls mt-3">
      {#if cameras.length > 1}
        <div class="mb-2">
          <label for="camera-select" class="form-label mb-1">
            <i class="bi bi-camera-video"></i> Camera
          </label>
          <select
            id="camera-select"
            class="form-select form-select-sm"
            bind:value={selectedCameraId}
            onchange={() => selectCamera(selectedCameraId)}
            title="Select Camera"
          >
            {#each cameras as camera}
              <option value={camera.id}>{camera.label}</option>
            {/each}
          </select>
        </div>
      {/if}

      <div class="control-row mb-2">
        <label for="zoom-slider" class="form-label mb-0 me-2">
          <i class="bi bi-zoom-in"></i> Zoom
        </label>
        <input
          id="zoom-slider"
          type="range"
          class="form-range flex-grow-1"
          min="1"
          max="5"
          step="0.5"
          value={zoom}
          oninput={(e) => setZoom(parseFloat((e.target as HTMLInputElement).value))}
          title="Zoom"
        />
      </div>

      <div class="control-row d-flex justify-content-center gap-2">
        <button
          class="btn btn-{torchOn ? 'warning' : 'outline-secondary'} btn-sm"
          onclick={toggleTorch}
          title="Toggle Flashlight"
        >
          <i class="bi bi-{torchOn ? 'lightning-fill' : 'lightning'}"></i>
        </button>
        <button
          class="btn btn-outline-danger btn-sm"
          onclick={() => stopScanning()}
          title="Stop Scanning"
        >
          <i class="bi bi-x-lg"></i> Stop
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .qr-scanner-component {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .scanner-container {
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    background: #f8f9fa;
  }

  #qr-reader {
    width: 100% !important;
  }

  #qr-reader__scan_region {
    min-height: 200px !important;
  }

  .scanner-controls {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 4px;
  }

  .control-row {
    display: flex;
    align-items: center;
  }

  .control-row .form-range {
    max-width: 200px;
  }

  @media (max-width: 576px) {
    .qr-scanner-component {
      max-width: 100%;
    }

    .scanner-container {
      padding: 0.75rem;
    }

    #qr-reader__scan_region {
      min-height: 180px !important;
    }

    .control-row .form-range {
      max-width: 150px;
    }
  }
</style>
