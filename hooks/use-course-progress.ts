import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseCourseProgressProps {
  userId: string;
  serviceId: string;
  progress: number;
}

export function useCourseProgress({ userId, serviceId, progress }: UseCourseProgressProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const markItemComplete = useCallback(async (moduleId: string, itemId: string, completed: boolean) => {
    if (!userId || !serviceId) {
      toast({
        title: "Error",
        description: "User or service information is missing",
        variant: "destructive",
      });
      return false;
    }

    setIsUpdating(true);
    try {
      const response = await api.updateCourseProgress(
        userId,
        serviceId,
        progress,
        moduleId,
        itemId,
        completed
      );

      if (response.success) {
        toast({
          title: "Success",
          description: completed ? "Item marked as completed!" : "Item marked as incomplete",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update progress",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [userId, serviceId, progress, toast]);

  const markModuleComplete = useCallback(async (moduleId: string, items: any[]) => {
    if (!items || items.length === 0) return false;

    // Mark all items in the module as completed
    const results = await Promise.all(
      items.map(item => markItemComplete(moduleId, item.id, true))
    );

    // Return true if all items were marked successfully
    return results.every(result => result === true);
  }, [markItemComplete]);

  return {
    markItemComplete,
    markModuleComplete,
    isUpdating,
  };
}
