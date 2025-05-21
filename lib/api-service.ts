export async function submitRodinJob(formData: FormData) {
  const response = await fetch("/api/rodin", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return await response.json()
}

export async function checkJobStatus(subscriptionKey: string) {
  const response = await fetch(`/api/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription_key: subscriptionKey,
    }),
  })

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`)
  }

  return await response.json()
}

export async function downloadModel(taskUuid: string) {
  const response = await fetch(`/api/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_uuid: taskUuid,
    }),
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  return await response.json()
}

export async function saveSearchHistory(
  modelType: string,
  keywords: string[],
  prompt: string,
  modelUrl?: string,
  downloadUrl?: string
) {
  try {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelType,
        keywords,
        prompt,
        modelUrl,
        downloadUrl,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save search history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving search history:', error);
    throw error;
  }
}
