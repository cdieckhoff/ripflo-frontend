// Shared formatting functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

export function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatHours(hours: number | undefined): string {
  if (hours === undefined || hours === null) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

// Work Order Status Functions
export enum WorkOrderStatusEnum {
  NEW = 1,
  DIAGNOSING = 2,
  IN_PROGRESS = 3,
  AWAITING_PARTS = 4,
  AWAITING_APPROVAL = 5,
  TESTING = 6,
  FINISHED = 7
}

export function getStatusString(status: number | string | undefined): string {
  if (status === undefined) return 'Unknown';

  // Handle numeric status codes
  if (typeof status === 'number') {
    switch (status) {
      case WorkOrderStatusEnum.NEW: return 'New';
      case WorkOrderStatusEnum.DIAGNOSING: return 'Diagnosing';
      case WorkOrderStatusEnum.IN_PROGRESS: return 'In Progress';
      case WorkOrderStatusEnum.AWAITING_PARTS: return 'Awaiting Parts';
      case WorkOrderStatusEnum.AWAITING_APPROVAL: return 'Awaiting Approval';
      case WorkOrderStatusEnum.TESTING: return 'Testing';
      case WorkOrderStatusEnum.FINISHED: return 'Finished';
      default: return `Status ${status}`;
    }
  }

  // Handle string status values
  if (typeof status === 'string') {
    switch (status.toLowerCase()) {
      case 'new': return 'New';
      case 'diagnosing': return 'Diagnosing';
      case 'in-progress': return 'In Progress';
      case 'awaiting-parts': return 'Awaiting Parts';
      case 'awaiting-approval': return 'Awaiting Approval';
      case 'testing': return 'Testing';
      case 'finished': return 'Finished';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
    }
  }

  return 'Unknown';
}

export function getStatusNumericValue(status: number | string | undefined): number {
  if (status === undefined) return 1; // Default to NEW

  // Handle numeric status codes
  if (typeof status === 'number') {
    return status;
  }

  // Handle string status values
  if (typeof status === 'string') {
    switch (status.toLowerCase()) {
      case 'new': return WorkOrderStatusEnum.NEW;
      case 'diagnosing': return WorkOrderStatusEnum.DIAGNOSING;
      case 'in-progress': return WorkOrderStatusEnum.IN_PROGRESS;
      case 'awaiting-parts': return WorkOrderStatusEnum.AWAITING_PARTS;
      case 'awaiting-approval': return WorkOrderStatusEnum.AWAITING_APPROVAL;
      case 'testing': return WorkOrderStatusEnum.TESTING;
      case 'finished': return WorkOrderStatusEnum.FINISHED;
      default: return 1; // Default to NEW for unrecognized statuses
    }
  }

  return 1; // Default to NEW
}

export function getStatusColor(status: number | string | undefined): string {
  if (status === undefined) return 'secondary';

  const numericStatus = getStatusNumericValue(status);

  switch (numericStatus) {
    case WorkOrderStatusEnum.NEW: return 'secondary';
    case WorkOrderStatusEnum.DIAGNOSING: return 'warning';
    case WorkOrderStatusEnum.IN_PROGRESS: return 'primary';
    case WorkOrderStatusEnum.AWAITING_PARTS: return 'info';
    case WorkOrderStatusEnum.AWAITING_APPROVAL: return 'warning';
    case WorkOrderStatusEnum.TESTING: return 'info';
    case WorkOrderStatusEnum.FINISHED: return 'success';
    default: return 'secondary';
  }
}

export function getStatusIcon(status: number | string | undefined): string {
  if (status === undefined) return 'bi-circle';

  // Handle string status values directly for consistency with CSS classes
  if (typeof status === 'string') {
    switch (status.toLowerCase()) {
      case 'new': return 'bi-clock';
      case 'diagnosing': return 'bi-clipboard-pulse';
      case 'in-progress': return 'bi-gear';
      case 'awaiting-parts': return 'bi-box';
      case 'awaiting-approval': return 'bi-file-earmark-check';
      case 'testing': return 'bi-speedometer';
      case 'finished': return 'bi-check-circle';
      default: return 'bi-circle';
    }
  }

  // Handle numeric status codes
  const numericStatus = getStatusNumericValue(status);
  switch (numericStatus) {
    case WorkOrderStatusEnum.NEW: return 'bi-clock';
    case WorkOrderStatusEnum.DIAGNOSING: return 'bi-clipboard-pulse';
    case WorkOrderStatusEnum.IN_PROGRESS: return 'bi-gear';
    case WorkOrderStatusEnum.AWAITING_PARTS: return 'bi-box';
    case WorkOrderStatusEnum.AWAITING_APPROVAL: return 'bi-file-earmark-check';
    case WorkOrderStatusEnum.TESTING: return 'bi-speedometer';
    case WorkOrderStatusEnum.FINISHED: return 'bi-check-circle';
    default: return 'bi-circle';
  }
}

export function getStatusClass(status: number | string | undefined): string {
  const color = getStatusColor(status);
  return `bg-${color}${color === 'warning' ? ' text-dark' : ''}`;
}