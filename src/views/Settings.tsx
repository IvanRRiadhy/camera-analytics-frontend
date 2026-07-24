import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Alert, 
  Divider,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import { 
  IconUser, 
  IconBuilding, 
  IconMail, 
  IconVideo,
  IconAdjustments,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { PhoneInput } from '../components/PhoneInput';

interface UserProfile {
  username: string;
  company: string;
  phone: string;
  email: string;
}

export const Settings: React.FC = () => {
  // Profile settings state
  const [profile, setProfile] = useState<UserProfile>({
    username: 'Admin Developer',
    company: 'CCTV Analytics Corp',
    phone: '6281234567890',
    email: 'admin@cctv.local'
  });
  
  const [countryCode, setCountryCode] = useState('ID');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // CCTV System settings state
  const [detectPerson, setDetectPerson] = useState(true);
  const [detectVehicle, setDetectVehicle] = useState(true);
  const [detectAnimal, setDetectAnimal] = useState(false);
  const [retentionDays, setRetentionDays] = useState(30);
  const [sensitivity, setSensitivity] = useState(80);
  const [webhookUrl, setWebhookUrl] = useState('https://api.cctv.local/webhook/alerts');

  // Load user data on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({
          username: parsed.username || 'Admin Developer',
          company: parsed.company || 'CCTV Analytics Corp',
          phone: parsed.phone || '6281234567890',
          email: parsed.email || 'admin@cctv.local'
        });
      } catch {
        // use default profile
      }
    }

    // Load CCTV settings if they exist
    const savedCCTV = localStorage.getItem('cctvSettings');
    if (savedCCTV) {
      try {
        const parsed = JSON.parse(savedCCTV);
        setDetectPerson(parsed.detectPerson ?? true);
        setDetectVehicle(parsed.detectVehicle ?? true);
        setDetectAnimal(parsed.detectAnimal ?? false);
        setRetentionDays(parsed.retentionDays ?? 30);
        setSensitivity(parsed.sensitivity ?? 80);
        setWebhookUrl(parsed.webhookUrl ?? 'https://api.cctv.local/webhook/alerts');
      } catch {
        // use default state
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile.username.trim() || !profile.company.trim() || !profile.email.trim() || !profile.phone.trim()) {
      setError('Please fill in all profile fields.');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(profile));
    setIsEditing(false);
    setSuccess('Profile updated successfully.');
  };

  const handleSaveCCTVSettings = () => {
    setError(null);
    setSuccess(null);

    const config = {
      detectPerson,
      detectVehicle,
      detectAnimal,
      retentionDays,
      sensitivity,
      webhookUrl
    };

    localStorage.setItem('cctvSettings', JSON.stringify(config));
    setSuccess('CCTV configuration saved successfully.');
  };

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column: Profile Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconUser size={22} style={{ opacity: 0.8 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  User Profile Settings
                </Typography>
              </Box>
              
              <Divider />

              <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Username"
                  disabled={!isEditing}
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <IconUser size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                      )
                    }
                  }}
                />

                <TextField
                  fullWidth
                  label="Organization / Company"
                  disabled={!isEditing}
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <IconBuilding size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                      )
                    }
                  }}
                />

                <PhoneInput
                  value={profile.phone}
                  onChange={(val: string) => setProfile({ ...profile, phone: val })}
                  countryCode={countryCode}
                  onCountryCodeChange={(code: string) => setCountryCode(code)}
                  disabled={!isEditing}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  disabled={!isEditing}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <IconMail size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                      )
                    }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                  {isEditing ? (
                    <>
                      <Button variant="outlined" color="inherit" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button variant="contained" color="primary" type="submit" startIcon={<IconDeviceFloppy size={18} />}>
                        Save Profile
                      </Button>
                    </>
                  ) : (
                    <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: CCTV Configuration Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconAdjustments size={22} style={{ opacity: 0.8 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  CCTV Analytics Rules
                </Typography>
              </Box>
              
              <Divider />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* AI Targets */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Active AI Classification Targets
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={detectPerson} onChange={(e) => setDetectPerson(e.target.checked)} color="primary" />}
                      label="Detect Humans / Persons"
                    />
                    <FormControlLabel
                      control={<Switch checked={detectVehicle} onChange={(e) => setDetectVehicle(e.target.checked)} color="primary" />}
                      label="Detect Vehicles (Cars, Trucks, Bikes)"
                    />
                    <FormControlLabel
                      control={<Switch checked={detectAnimal} onChange={(e) => setDetectAnimal(e.target.checked)} color="primary" />}
                      label="Detect Animals"
                    />
                  </Box>
                </Box>

                {/* AI Confidence Sensitivity */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Detection Confidence Sensitivity ({sensitivity}%)
                  </Typography>
                  <Slider
                    value={sensitivity}
                    onChange={(_, val) => setSensitivity(val as number)}
                    valueLabelDisplay="auto"
                    min={10}
                    max={100}
                    color="primary"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Lower sensitivity will yield more detections but increase false alarms.
                  </Typography>
                </Box>

                {/* Video Retention */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Recording Storage Retention
                  </Typography>
                  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 8 }}>
                      <Slider
                        value={retentionDays}
                        onChange={(_, val) => setRetentionDays(val as number)}
                        min={7}
                        max={90}
                        step={1}
                        valueLabelDisplay="auto"
                        color="secondary"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {retentionDays} Days
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Alert Webhook Web Url */}
                <Box>
                  <TextField
                    fullWidth
                    label="Incident Alert Webhook URL"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/cctv/alerts"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <IconVideo size={18} style={{ marginRight: 8, opacity: 0.5 }} />
                        )
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="contained" color="secondary" onClick={handleSaveCCTVSettings} startIcon={<IconDeviceFloppy size={18} />}>
                    Save CCTV Rules
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
