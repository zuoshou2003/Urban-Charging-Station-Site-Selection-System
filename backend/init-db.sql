-- 检查并创建充电站表
CREATE TABLE IF NOT EXISTS charging_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    type VARCHAR(50),
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 检查并创建停车场表
CREATE TABLE IF NOT EXISTS parking_lots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    capacity INTEGER,
    available_spaces INTEGER,
    type VARCHAR(50),
    address VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 检查并创建推荐表
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    score NUMERIC(5, 2),
    factors JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入一些测试数据（如果表是空的）
INSERT INTO charging_stations (name, latitude, longitude, type, address, phone)
SELECT '南京示范充电站', 32.058, 118.796, '快充站', '南京市玄武区中山路100号', '025-12345678'
WHERE NOT EXISTS (SELECT 1 FROM charging_stations LIMIT 1);

INSERT INTO charging_stations (name, latitude, longitude, type, address, phone)
SELECT '江宁充电站', 31.953, 118.839, '慢充站', '南京市江宁区胜太路88号', '025-87654321'
WHERE NOT EXISTS (SELECT 1 FROM charging_stations WHERE name = '江宁充电站');

INSERT INTO charging_stations (name, latitude, longitude, type, address, phone)
SELECT '鼓楼科技园充电站', 32.066, 118.783, '综合充电站', '南京市鼓楼区汉中路145号', '025-98765432'
WHERE NOT EXISTS (SELECT 1 FROM charging_stations WHERE name = '鼓楼科技园充电站');

-- 插入停车场测试数据
INSERT INTO parking_lots (name, latitude, longitude, capacity, available_spaces, type, address, phone)
SELECT '中山停车场', 32.058, 118.796, 100, 35, '地下停车场', '南京市玄武区中山路100号', '025-12345678'
WHERE NOT EXISTS (SELECT 1 FROM parking_lots LIMIT 1);

INSERT INTO parking_lots (name, latitude, longitude, capacity, available_spaces, type, address, phone)
SELECT '新街口停车场', 32.040, 118.780, 80, 20, '路边停车场', '南京市鼓楼区汉中路45号', '025-87654321'
WHERE NOT EXISTS (SELECT 1 FROM parking_lots WHERE name = '新街口停车场');

INSERT INTO parking_lots (name, latitude, longitude, capacity, available_spaces, type, address, phone)
SELECT '仙林大学城停车场', 32.070, 118.802, 120, 50, '露天停车场', '南京市栖霞区仙林大道163号', '025-98765432'
WHERE NOT EXISTS (SELECT 1 FROM parking_lots WHERE name = '仙林大学城停车场'); 