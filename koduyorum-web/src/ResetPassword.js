import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token, uid } = useParams(); 
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async () => {

        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reset_password/${uid}/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login'); // Redirect to login after success
                }, 3000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to reset the password.');
            }
        } catch (error) {
            setError('An error occurred while resetting the password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <h1>Reset Your Password</h1>
            {error && <div className="error-message">{error}</div>}
            {success ? (
                <div className="success-message">Your password has been reset successfully! Redirecting to login...</div>
            ) : (
                <div className="form-container">
                    <div className="form-group">
                        <label htmlFor="new-password">New Password</label>
                        <input
                            type="password"
                            id="new-password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <button onClick={handlePasswordReset} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;
