import React, { useState } from 'react';
import { showNotification } from './NotificationCenter';

const CreateAnnotation = ({ visible, selectedText, startIndex, endIndex, language_id, annotationId, onClose }) => {
  const [annotationText, setAnnotationText] = useState('');

  if (!visible) {
    return null; // Do not render anything if the modal is not visible
  }

  const handleSubmit = async () =>  {
    console.log(annotationId);
    const url = annotationId
      ? `${process.env.REACT_APP_API_URL}/edit_annotation/${annotationId}/` // Edit existing annotation
      :`${process.env.REACT_APP_API_URL}/create_annotation/`; // Create new annotation

    const method = annotationId ? 'PUT' : 'POST';


    if (!annotationText) {
        console.error('Annotation text required')
        return;
    }

    try {
        const user_id = localStorage.getItem('user_id');

        const annotationData = {
            text: annotationText,
            language_qid: language_id.replace(/^Q/, ''), // Removes the 'Q' at the beginning
            annotation_starting_point:startIndex, 
            annotation_ending_point:endIndex,
            type: 'annotation',
        };

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-ID': user_id, 
            },
            body: JSON.stringify(annotationData),
        });

        if (response.status === 201 || response.status === 200) {
           
            setAnnotationText('');
            console.log('Success')
            // onClose();
            window.location.reload();
        } else {
            const data = await response.json();
            console.error('Error adding annotation:', data);
            showNotification(data.error, 'just now');
        }
    } catch (error) {
        showNotification('An error occurred while adding annotation', 'just now');
        console.error('Error adding annotation:', error);
    }
  }

  return (
    <div className="custom-modal">
      <div className="modal-content">
      <h3>{annotationId ? 'Edit Annotation' : 'Create Annotation'}</h3>
      <p><strong>Selected Text:</strong> {selectedText}</p>
        <textarea
          value={annotationText}
          onChange={(e) => setAnnotationText(e.target.value)}
          placeholder="Enter your annotation..."
        />
        <div className="modal-buttons">
        <button
          className={annotationId ? "save-button" : "create-button"}
          onClick={handleSubmit}
        >
          {annotationId ? "Save Changes" : "Create"}
        </button>
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
        </div>
      </div>

      {/* Basic Styles */}
      <style>
        {`
          .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100;
          }
          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          textarea {
            width: 100%;
            height: 80px;
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: none;
          }
          .modal-buttons {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }
          .save-button {
            background: #007bff; /* Blue color for Save Changes */
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .save-button:hover {
            background: #0056b3; /* Darker blue on hover */
          }
          .create-button {
            background: #28a745; /* Green color for Create */
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .create-button:hover {
            background: #218838; /* Darker green on hover */
          }
          .cancel-button {
            background: #f44336;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `}
      </style>
    </div>
  );
};

export default CreateAnnotation;