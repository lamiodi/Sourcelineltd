import React, { useState, useEffect } from 'react';
import { Calendar, Users, Briefcase, Plus, Trash, FloppyDisk, CheckCircle } from '@phosphor-icons/react';
import { API_URL } from '../../config';
import { team as teamData } from '../../data';

const DailyReports = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isPublicHoliday, setIsPublicHoliday] = useState(false);
  const [activities, setActivities] = useState([{ worker_name: '', activity: '', category: 'Office', site_gone_to: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const workerOptions = teamData
    .filter(member => member.position !== "Principal Surveyor" && member.name !== "Omotosho Kudrat Febisola")
    .map(member => member.name);

  const fetchReport = async (selectedDate) => {
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/daily-reports/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsPublicHoliday(data.is_public_holiday || false);
        if (data.activities && data.activities.length > 0) {
          setActivities(data.activities.map(a => ({...a, category: a.category || 'Office', site_gone_to: a.site_gone_to || ''})));
        } else {
          setActivities([{ worker_name: '', activity: '', category: 'Office', site_gone_to: '' }]);
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setMessage({ text: 'Failed to fetch report data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(date);
  }, [date]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleAddActivity = () => {
    setActivities([...activities, { worker_name: '', activity: '', category: 'Office', site_gone_to: '' }]);
  };

  const handleRemoveActivity = (index) => {
    const newActivities = activities.filter((_, i) => i !== index);
    if (newActivities.length === 0) {
      newActivities.push({ worker_name: '', activity: '', category: 'Office', site_gone_to: '' });
    }
    setActivities(newActivities);
  };

  const handleActivityChange = (index, field, value) => {
    const newActivities = [...activities];
    newActivities[index][field] = value;
    setActivities(newActivities);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    // Filter out empty activities if not a public holiday
    const filteredActivities = activities.filter(a => a.worker_name.trim() !== '' && a.activity.trim() !== '');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/daily-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          is_public_holiday: isPublicHoliday,
          activities: filteredActivities
        })
      });
      
      if (response.ok) {
        setMessage({ text: 'Daily report saved successfully', type: 'success' });
        if (!isPublicHoliday && filteredActivities.length === 0) {
           setActivities([{ worker_name: '', activity: '', category: 'Office', site_gone_to: '' }]);
        } else {
           setActivities(filteredActivities.length > 0 ? filteredActivities : [{ worker_name: '', activity: '', category: 'Office', site_gone_to: '' }]);
        }
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      setMessage({ text: 'Failed to save the report', type: 'error' });
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  const uniqueSites = [...new Set(activities.map(a => a.site_gone_to).filter(Boolean))];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar className="mr-2" /> Daily Worker Reports
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Record daily activities for workers. Automated emails are sent at 5:10 PM on weekdays.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-4xl">
        {/* Date and Holiday Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-8 border-b pb-6">
          <div className="flex-1">
            <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 mb-1">
              Report Date
            </label>
            <input
              type="date"
              id="report-date"
              value={date}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-4 py-2 border"
            />
          </div>
          
          <div className="flex items-center h-10">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublicHoliday}
                onChange={(e) => setIsPublicHoliday(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="ml-2 text-md font-medium text-gray-700 bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                Mark as Public Holiday
              </span>
            </label>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.type === 'success' && <CheckCircle className="mr-2 h-5 w-5" />}
            {message.text}
          </div>
        )}

        {/* Activities Section */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isPublicHoliday ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">Public Holiday</h3>
            <p className="mt-1 text-sm text-gray-500">No worker activities needed for public holidays.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="mr-2" /> Worker Activities
              </h3>
            </div>
            
            {activities.map((item, index) => (
              <div key={index} className="flex flex-col gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Worker Name</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                      value={item.worker_name}
                      onChange={(e) => handleActivityChange(index, 'worker_name', e.target.value)}
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white h-[38px] appearance-none"
                    >
                      <option value="" disabled>Select Worker</option>
                      {workerOptions.map((name, idx) => (
                        <option key={idx} value={name}>{name}</option>
                      ))}
                    </select>
                    </div>
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                    <select
                      value={item.category || 'Office'}
                      onChange={(e) => handleActivityChange(index, 'category', e.target.value)}
                      className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white h-[38px]"
                    >
                      <option value="Office">Office</option>
                      <option value="Site">Site</option>
                      <option value="Office & Site">Office & Site</option>
                    </select>
                  </div>
                  {(item.category === 'Site' || item.category === 'Office & Site') && (
                    <div className="w-full sm:w-5/12">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Site Name</label>
                      <input
                        type="text"
                        list="recent-sites"
                        value={item.site_gone_to || ''}
                        onChange={(e) => handleActivityChange(index, 'site_gone_to', e.target.value)}
                        placeholder="e.g. Lekki Phase 1"
                        className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border h-[38px]"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="w-full sm:w-flex-1 flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tasks Completed</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        value={item.activity}
                        onChange={(e) => handleActivityChange(index, 'activity', e.target.value)}
                        placeholder="Describe what they did today..."
                        rows={2}
                        className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      />
                    </div>
                  </div>
                  <div className="pt-5 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(index)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 h-9 w-9 justify-center mb-1"
                      title="Remove activity"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddActivity}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                Add Worker
              </button>
            </div>
            
            <datalist id="recent-sites">
              {uniqueSites.map((site, idx) => (
                <option key={idx} value={site} />
              ))}
            </datalist>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FloppyDisk className="mr-2 h-5 w-5" /> Save Daily Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReports;
