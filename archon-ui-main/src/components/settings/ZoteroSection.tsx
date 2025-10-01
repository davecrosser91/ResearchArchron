import { useState, useEffect } from 'react';
import { BookMarked, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { credentialsService } from '../../services/credentialsService';
import { useToast } from '../../features/shared/hooks/useToast';

export const ZoteroSection = () => {
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalApiKey, setOriginalApiKey] = useState('');
  const [originalUserId, setOriginalUserId] = useState('');
  const [originalGroupId, setOriginalGroupId] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadCredentials();
  }, []);

  useEffect(() => {
    const changed =
      apiKey !== originalApiKey ||
      userId !== originalUserId ||
      groupId !== originalGroupId;
    console.log('hasChanges check:', {
      changed,
      apiKey: apiKey ? '[SET]' : '[EMPTY]',
      originalApiKey: originalApiKey ? '[SET]' : '[EMPTY]',
      userId,
      originalUserId,
      groupId,
      originalGroupId
    });
    setHasChanges(changed);
  }, [apiKey, userId, groupId, originalApiKey, originalUserId, originalGroupId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);

      // Load Zotero credentials (ignore 404s for missing credentials)
      let apiKeyData, userIdData, groupIdData;

      try {
        apiKeyData = await credentialsService.getCredential('ZOTERO_TOKEN');
      } catch (err) {
        // Credential doesn't exist yet
        apiKeyData = null;
      }

      try {
        userIdData = await credentialsService.getCredential('ZOTERO_USER_ID');
      } catch (err) {
        userIdData = null;
      }

      try {
        groupIdData = await credentialsService.getCredential('ZOTERO_GROUP_ID');
      } catch (err) {
        groupIdData = null;
      }

      const apiKeyValue = apiKeyData?.value || '';
      const userIdValue = (userIdData?.value || '').trim();
      const groupIdValue = (groupIdData?.value || '').trim();

      setApiKey(apiKeyValue);
      setUserId(userIdValue);
      setGroupId(groupIdValue);
      setOriginalApiKey(apiKeyValue);
      setOriginalUserId(userIdValue);
      setOriginalGroupId(groupIdValue);
    } catch (err) {
      console.error('Failed to load Zotero credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called', { apiKey: apiKey ? '[SET]' : '[EMPTY]', userId, groupId });

    if (!apiKey) {
      showToast('Zotero API key is required', 'error');
      return;
    }

    if (!userId && !groupId) {
      showToast('Either User ID or Group ID must be provided', 'error');
      return;
    }

    setSaving(true);

    try {
      console.log('Saving ZOTERO_TOKEN...');
      // Save API key (encrypted)
      await credentialsService.createCredential({
        key: 'ZOTERO_TOKEN',
        value: apiKey,
        description: 'Zotero API key for accessing your library',
        is_encrypted: true,
        category: 'integrations'
      });
      console.log('ZOTERO_TOKEN saved');

      // Save User ID (not encrypted, trimmed)
      const trimmedUserId = userId.trim();
      if (trimmedUserId) {
        console.log('Saving ZOTERO_USER_ID...');
        await credentialsService.createCredential({
          key: 'ZOTERO_USER_ID',
          value: trimmedUserId,
          description: 'Zotero user library ID',
          is_encrypted: false,
          category: 'integrations'
        });
        console.log('ZOTERO_USER_ID saved');
      } else {
        // Delete if exists but now empty
        try {
          console.log('Deleting ZOTERO_USER_ID...');
          await credentialsService.deleteCredential('ZOTERO_USER_ID');
        } catch {
          // Ignore if doesn't exist
        }
      }

      // Save Group ID (not encrypted, trimmed)
      const trimmedGroupId = groupId.trim();
      if (trimmedGroupId) {
        console.log('Saving ZOTERO_GROUP_ID...');
        await credentialsService.createCredential({
          key: 'ZOTERO_GROUP_ID',
          value: trimmedGroupId,
          description: 'Zotero group library ID',
          is_encrypted: false,
          category: 'integrations'
        });
        console.log('ZOTERO_GROUP_ID saved');
      } else {
        // Delete if exists but now empty
        try {
          console.log('Deleting ZOTERO_GROUP_ID...');
          await credentialsService.deleteCredential('ZOTERO_GROUP_ID');
        } catch {
          // Ignore if doesn't exist
        }
      }

      console.log('All credentials saved successfully');
      showToast('Zotero credentials saved successfully', 'success');
      await loadCredentials(); // Reload to refresh state
    } catch (err) {
      console.error('Failed to save Zotero credentials:', err);
      showToast(`Failed to save Zotero credentials: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card accentColor="purple" className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  console.log('ZoteroSection render:', { hasChanges, saving, disabled: saving || !hasChanges });

  return (
    <Card accentColor="purple" className="p-8">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-purple-500" />
            Zotero Integration
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Configure your Zotero credentials to sync research papers to the knowledge base.
            Get your API key from{' '}
            <a
              href="https://www.zotero.org/settings/keys/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Zotero Settings
            </a>
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Zotero API key"
              className="w-full px-3 py-2 pr-20 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5">
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* User ID or Group ID */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm"
              disabled={!!groupId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group ID
            </label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="e.g. 87654321"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm"
              disabled={!!userId}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Provide either a User ID (for personal library) or Group ID (for group library), not both.
        </p>

        {/* Save button - always show it */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {hasChanges && (
            <Button
              variant="ghost"
              onClick={loadCredentials}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            accentColor="purple"
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Zotero Credentials
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
