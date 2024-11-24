import React, { useState } from 'react';

const CreateAnnotation = ({ visible, selectedText, startIndex, endIndex, language_id, onClose }) => {
  const [annotationText, setAnnotationText] = useState('');

  if (!visible) {
    return null; // Do not render anything if the modal is not visible
  }

  const handleSubmitAnnotation = async () =>  {
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

        const response = await fetch(`${process.env.REACT_APP_API_URL}/create_annotation/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-ID': user_id, 
            },
            body: JSON.stringify(annotationData),
        });

        if (response.status === 201) {
           
            setAnnotationText('');
            console.log('Success')

         
        } else {
            const data = await response.json();
            console.error('Error adding annotation:', data);
        }
    } catch (error) {
        console.error('Error adding annotation:', error);
    }
  }

  return (
    <div className="custom-modal">
      <div className="modal-content">
        <h3>Add Annotation</h3>
        <p><strong>Selected Text:</strong> {selectedText}</p>
        <textarea
          value={annotationText}
          onChange={(e) => setAnnotationText(e.target.value)}
          placeholder="Enter your annotation..."
        />
        <div className="modal-buttons">
          <button className="submit-button" onClick={handleSubmitAnnotation}>Submit</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
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
            z-index: 1000;
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
          .submit-button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
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