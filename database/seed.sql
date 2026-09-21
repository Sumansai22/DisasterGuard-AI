INSERT INTO stations
(station_code, name, latitude, longitude, region, elevation, status)
VALUES
('LS-001', 'Nilgiri North', 11.4064, 76.6932, 'Nilgiris', 1850, 'active'),
('LS-002', 'Munnar East', 10.0889, 77.0595, 'Munnar', 1520, 'active'),
('LS-003', 'Wayanad South', 11.6854, 76.1320, 'Wayanad', 900, 'active')
ON CONFLICT (station_code) DO NOTHING;