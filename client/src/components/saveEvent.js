import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css";

function SaveEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const tableData = location.state.tableData; // Retrieve passed table data

  // State for form fields
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationText, setLocationText] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Check if user is logged in
  const userId = localStorage.getItem('userId');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!userId);

  // New state variable for form validation
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever relevant fields change
  useEffect(() => {
    setIsFormValid(!!eventName.trim() && !!startDate && !!endDate && isUserLoggedIn);
  }, [eventName, startDate, endDate, isUserLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if mandatory fields are filled
    if (!eventName.trim() || !startDate || !endDate) {
      window.alert("Please fill out the Event Name, Start Date, and End Date.");
      return; // Prevent the form from submitting
    }

    const eventData = {
      eventName,
      startDate,
      endDate,
      location: locationText,
      additionalInfo,
      tableData,
      userId
    };

    try {
      // Send a POST request to your server endpoint
      const response = await fetch('http://localhost:5050/saveEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.text();

      if (response.ok) {
        // Redirect or display success message
        navigate('/path-to-redirect');
      } else {
        window.alert(data); // Display error message
      }
    } catch (error) {
      window.alert("There was a problem with saving the event: " + error.message);
    }
  };

  return (
    <div className='event-container'>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>

      <h2>Save Event Details</h2>
      {/* Form for event details */}
      <label htmlFor="eventName">Event Name <span className="required-asterisk">*</span></label>
      <input
        id="eventName"
        type="text"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        placeholder="Enter event name"
      />

      <label htmlFor="startDate">Start Date <span className="required-asterisk">*</span></label>
      <input
        id="startDate"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label htmlFor="endDate">End Date <span className="required-asterisk">*</span></label>
      <input
        id="endDate"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <label htmlFor="locationText">Location</label>
      <input
        id="locationText"
        type="text"
        value={locationText}
        onChange={(e) => setLocationText(e.target.value)}
        placeholder="Enter location"
      />

      <label htmlFor="additionalInfo">Additional Info</label>
      <input
        id="additionalInfo"
        type="text"
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        placeholder="Enter additional info"
      />
      <button 
        className={`btn btn-submit ${!isFormValid ? 'disabled-button' : ''}`} 
        onClick={handleSubmit} 
        disabled={!isFormValid}
      >
        Save Event Info
      </button>
      {!isUserLoggedIn && (
        <p className="login-message">
          Must be logged in to save event.
        </p>
      )}
    </div>
  );
}

export default SaveEvent;
