-- Tabla de Roles (Admin, Editor, etc.)
-- DROP DATABASE talentohumano360;
CREATE DATABASE talentohumano360;
USE talentohumano360;


CREATE TABLE ROLES (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name_role VARCHAR(50) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_rol TINYINT(1) DEFAULT 1
);


-- Tabla de Permisos (Crear, Editar, Leer, Eliminar)
CREATE TABLE PERMISSIONS (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_permissions TINYINT(1) DEFAULT 1
);
-- Tabla de Páginas (Vistas del Front-end)
CREATE TABLE PAGES (
    page_id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(100) NOT NULL,
    route VARCHAR(255) NOT NULL,
    description TEXT,
    status_page TINYINT(1) DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    page_route VARCHAR(255) -- Según tu diagrama
);
-- Tabla Maestra de Tipos de Eventos (Para la trazabilidad)
CREATE TABLE MASTER_TYPE_EVENT (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    status_id INT DEFAULT 1,
    created_at DATE,
    description VARCHAR(255)
);
-- Tabla de Usuarios
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at DATETIME,
    name VARCHAR(100),
    last_name VARCHAR(100),
    status_id INT DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES ROLES(role_id)
);
-- Relación Muchos a Muchos: Roles y Permisos
CREATE TABLE ROLE_PERMISSIONS (
    role_permissions_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    permission_id INT,
    FOREIGN KEY (role_id) REFERENCES ROLES(role_id),
    FOREIGN KEY (permission_id) REFERENCES PERMISSIONS(permission_id)
);
-- Relación Muchos a Muchos: Roles y Páginas
CREATE TABLE ROLE_PAGES (
    role_page_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    page_id INT,
    FOREIGN KEY (role_id) REFERENCES ROLES(role_id),
    FOREIGN KEY (page_id) REFERENCES PAGES(page_id)
);
CREATE TABLE SYSTEM_TRAZABILITY (
    trazability_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_id INT,
    page_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    details_json JSON, -- Muy útil para guardar logs detallados
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (event_id) REFERENCES MASTER_TYPE_EVENT(event_id),
    FOREIGN KEY (page_id) REFERENCES PAGES(page_id)
);


-- Flujo de centro de costos.

CREATE TABLE STATUS_MASTER (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS MASTER_REGIONAL (
    regional_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_reg_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

CREATE TABLE MASTER_LEADER (
    leader_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_lead_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

CREATE TABLE MASTER_UNIT (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    CONSTRAINT fk_unit_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

CREATE TABLE ZONA (
    zona_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    regional_id INT,
    CONSTRAINT fk_zona_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id),
    CONSTRAINT fk_zona_reg FOREIGN KEY (regional_id) REFERENCES MASTER_REGIONAL(regional_id)
);

CREATE TABLE MASTER_OFFICES (
    office_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status_id INT NOT NULL,
    departament_id INT,
    leader_id INT,
    zona_id INT,
    created_ad DATE,
    CONSTRAINT fk_off_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id),
    CONSTRAINT fk_off_lead FOREIGN KEY (leader_id) REFERENCES MASTER_LEADER(leader_id),
    CONSTRAINT fk_off_zona FOREIGN KEY (zona_id) REFERENCES ZONA(zona_id)
);

CREATE TABLE COST_CENTER (
    cost_center_id INT AUTO_INCREMENT PRIMARY KEY,
    regional_id INT,
    helisa_cc VARCHAR(20), 
    unit_id INT,
    office_id INT,
    ptr INT,
    city_id INT,
    area_id INT,
    company_id INT,
    leader_id INT,
    client_id INT,
    CONSTRAINT fk_cc_reg FOREIGN KEY (regional_id) REFERENCES MASTER_REGIONAL(regional_id),
    CONSTRAINT fk_cc_unit FOREIGN KEY (unit_id) REFERENCES MASTER_UNIT(unit_id),
    CONSTRAINT fk_cc_off FOREIGN KEY (office_id) REFERENCES MASTER_OFFICES(office_id),
    CONSTRAINT fk_cc_lead FOREIGN KEY (leader_id) REFERENCES MASTER_LEADER(leader_id)
);


-- Esto crea el registro que MASTER_REGIONAL está buscando
INSERT INTO STATUS_MASTER (status_id, status) VALUES (1, 'Activo');

-- Opcional: agrega otros estados comunes
INSERT INTO STATUS_MASTER (status) VALUES ('Inactivo'), ('Pendiente');

-- 1. REGISTROS PARA MASTER_REGIONAL
INSERT INTO MASTER_REGIONAL (name, status_id) VALUES 
('ZONA BOGOTA', 1),
('NORORIENTE', 1),
('ANTIOQUIA Y SABANAS', 1),
('BOGOTÁ Y CENTRO', 1),
('EJE CAFETERO Y SUR', 1),
('ZONA NORTE', 1),
('GESTORIA ANTIOQUIA Y SABANAS', 1),
('GESTORIA BOGOTA Y CENTRO', 1),
('ZONA OCCIDENTE', 1),
('ZONA ORIENTE', 1),
('ZONA CENTRO', 1),
('ZONA MEDELLIN', 1),
('TROPAS ANTIOQUIA Y SABANAS', 1),
('TROPAS BOGOTA Y CENTRO', 1),
('TROPAS SUR', 1),
('ADMINISTRACION', 1),
('ZONA SUPERVISOR', 1);

-- 3. REGISTROS PARA MASTER_UNIT
INSERT INTO MASTER_UNIT (name, status_id) VALUES 
('TRANSACCIONAL', 1),
('ESPECIALIZADA', 1);

-- Flujo de ciudades y departamentos.

-- 1. Crear Departamentos
CREATE TABLE IF NOT EXISTS MASTER_DEPARTAMENT (
    departament_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code_dane VARCHAR(5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT,
    CONSTRAINT fk_dept_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);
-- 2. Crear Ciudades
CREATE TABLE IF NOT EXISTS MASTER_CITIES (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    codigo_dane VARCHAR(5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    departament_id INT,
    status_id INT,
    CONSTRAINT fk_city_dept FOREIGN KEY (departament_id) REFERENCES MASTER_DEPARTAMENT(departament_id),
    CONSTRAINT fk_city_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id)
);

INSERT INTO MASTER_DEPARTAMENT (name, status_id) VALUES 
('VALLE DEL CAUCA', 1), ('CUNDINAMARCA', 1), ('ATLANTICO', 1), 
('ANTIOQUIA', 1), ('BOLIVAR', 1), ('TOLIMA', 1), ('HUILA', 1), 
('CESAR', 1), ('SANTANDER', 1), ('SUCRE', 1), ('MAGDALENA', 1), 
('CORDOBA', 1), ('QUINDIO', 1), ('BOYACA', 1), ('CALDAS', 1), 
('CASANARE', 1), ('ARAUCA', 1), ('LA GUAJIRA', 1), ('META', 1), 
('RISARALDA', 1), ('CAQUETA', 1), ('N. DE SANTANDER', 1), ('NARIÑO', 1), 
('CAUCA', 1), ('AMAZONAS', 1), ('PUTUMAYO', 1), ('GUAVIARE', 1), 
('VAUPES', 1), ('VICHADA', 1), ('SAN ANDRES', 1), ('GUAINIA', 1);

INSERT INTO MASTER_CITIES (name, departament_id, status_id) VALUES 
('PALMIRA', 1, 1), ('CALI', 1, 1), ('BUGALAGRANDE', 1, 1), ('SEVILLA', 1, 1), ('FLORIDA', 1, 1), ('LA UNION', 1, 1), ('TULUA', 1, 1), ('GINEBRA', 1, 1), ('EL CERRITO', 1, 1), ('CANDELARIA', 1, 1), ('CARTAGO', 1, 1), ('YUMBO', 1, 1), ('GUACARI', 1, 1), ('JAMUNDI', 1, 1), ('LA VICTORIA', 1, 1), ('BUENAVENTURA', 1, 1), ('PRADERA', 1, 1), ('BUGA', 1, 1), ('GUADALAJARA DE BUGA', 1, 1), ('ROLDANILLO', 1, 1), ('ZARZAL', 1, 1), ('ANDALUCIA', 1, 1), ('TRUJILLO', 1, 1), ('CAICEDONIA', 1, 1), ('BOGOTA', 2, 1), ('SOACHA', 2, 1), ('FUNZA', 2, 1), ('CHIA', 2, 1), ('ZIPAQUIRA', 2, 1), ('FACATATIVA', 2, 1), ('MADRID', 2, 1), ('CAJICA', 2, 1), ('SIBATE', 2, 1), ('TOCANCIPA', 2, 1), ('GACHANCIPA', 2, 1), ('VILLA DE SAN DIEGO DE UBATE', 2, 1), ('UBATE', 2, 1), ('COTA', 2, 1), ('BOGOTA DC', 2, 1), ('GACHANCIPÁ', 2, 1), ('GIRARDOT', 2, 1), ('ARBELAEZ', 2, 1), ('CHOCONTA', 2, 1), ('BARRANQUILLA', 3, 1), ('SOLEDAD', 3, 1), ('JUAN DE ACOSTA', 3, 1), ('SANTO TOMAS', 3, 1), ('PUERTO COLOMBIA', 3, 1), ('PONEDERA', 3, 1), ('MEDELLIN', 4, 1), ('ITAGUI', 4, 1), ('SABANETA', 4, 1), ('RIONEGRO', 4, 1), ('BELLO', 4, 1), ('GIRARDOTA', 4, 1), ('ENVIGADO', 4, 1), ('SOPETRAN', 4, 1), ('CAUCASIA', 4, 1), ('EL PEÑOL', 4, 1), ('ARBOLETES', 4, 1), ('BARBOSA', 4, 1), ('SAN JERONIMO', 4, 1), ('SANTAFE DE ANTIOQUIA', 4, 1), ('YOLOMBO', 4, 1), ('COPACABANA', 4, 1), ('LA CEJA', 4, 1), ('PUERTO BERRIO', 4, 1), ('YONDO', 4, 1), ('EL SANTUARIO', 4, 1), ('MARINILLA', 4, 1), ('APARTADO', 4, 1), ('CAREPA', 4, 1), ('BETULIA', 4, 1), ('CARTAGENA', 5, 1), ('SANTA CRUZ DE MOMPOX', 5, 1), ('MOMPOS', 5, 1), ('TURBACO', 5, 1), ('MAGANGUE', 5, 1), ('MAHATES', 5, 1), ('ZAMBRANO', 5, 1), ('IBAGUE', 6, 1), ('ESPINAL', 6, 1), ('LIBANO', 6, 1), ('NATAGAIMA', 6, 1), ('AMBALEMA', 6, 1), ('PLANADAS', 6, 1), ('FLANDES', 6, 1), ('NEIVA', 7, 1), ('LA PLATA', 7, 1), ('ACEVEDO', 7, 1), ('PITALITO', 7, 1), ('SAN AGUSTIN', 7, 1), ('YAGUARA', 7, 1), ('PITALITO HUILA', 7, 1), ('GIGANTE', 7, 1), ('VALLEDUPAR', 8, 1), ('BOSCONIA', 8, 1), ('SAN ALBERTO', 8, 1), ('EL PASO', 8, 1), ('CURUMANI', 8, 1), ('BUCARAMANGA', 9, 1), ('SAN GIL', 9, 1), ('PIEDECUESTA', 9, 1), ('FLORIDABLANCA', 9, 1), ('EL PLAYON', 9, 1), ('GIRON', 9, 1), ('BARRANCABERMEJA', 9, 1), ('VALLE DE SAN JOSE', 9, 1), ('PUENTE NACIONAL', 9, 1), ('CHARALA', 9, 1), ('SUAITA', 9, 1), ('SINCELEJO', 10, 1), ('COROZAL', 10, 1), ('MORROA', 10, 1), ('SANTA MARTA', 11, 1), ('FUNDACIÓN', 11, 1), ('CIENAGA', 11, 1), ('SALAMINA', 11, 1), ('PLATO', 11, 1), ('MONTERIA', 12, 1), ('MONTELIBANO', 12, 1), ('AYAPEL', 12, 1), ('LA APARTADA', 12, 1), ('ARMENIA', 13, 1), ('MONTENEGRO', 13, 1), ('CIRCASIA', 13, 1), ('CALARCA', 13, 1), ('DUITAMA', 14, 1), ('SOGAMOSO', 14, 1), ('CHIQUINQUIRA', 14, 1), ('RAMIRIQUI', 14, 1), ('MONIQUIRA', 14, 1), ('PACHAVITA', 14, 1), ('TUNJA', 14, 1), ('SAN MIGUEL DE SEMA', 14, 1), ('MANIZALES', 15, 1), ('VILLAMARIA', 15, 1), ('RIOSUCIO', 15, 1), ('LA DORADA', 15, 1), ('MANZANARES', 15, 1), ('YOPAL', 16, 1), ('OROCUE', 16, 1), ('ARAUCA', 17, 1), ('RIOHACHA', 18, 1), ('HATONUEVO', 18, 1), ('FONSECA', 18, 1), ('MAICAO', 18, 1), ('DISTRACCION', 18, 1), ('SAN JUAN DEL CESAR', 18, 1), ('MANAURE', 18, 1), ('URIBIA', 18, 1), ('BARRANCAS', 18, 1), ('DIBULLA', 18, 1), ('VILLAVICENCIO', 19, 1), ('RESTREPO', 19, 1), ('ACACIAS', 19, 1), ('CASTILLA LA NUEVA', 19, 1), ('GRANADA', 19, 1), ('BARRANCA DE UPIA', 19, 1), ('PEREIRA', 20, 1), ('DOSQUEBRADAS', 20, 1), ('SANTA ROSA DE CABAL', 20, 1), ('LA VIRGINIA', 20, 1), ('QUINCHIA', 20, 1), ('FLORENCIA', 21, 1), ('SAN VICENTE DEL CAGUÁN', 21, 1), ('PUERTO RICO', 21, 1), ('CUCUTA', 22, 1), ('LOS PATIOS', 22, 1), ('OCAÑA', 22, 1), ('PASTO', 23, 1), ('SAN ANDRES DE TUMACO', 23, 1), ('IPIALES', 23, 1), ('PUPIALES', 23, 1), ('TUMACO', 23, 1), ('POPAYAN', 24, 1), ('LETICIA', 25, 1), ('MOCOA', 26, 1), ('VALLE DEL GUAMUEZ', 26, 1), ('PUERTO ASIS', 26, 1), ('SIBUNDOY', 26, 1), ('SAN JOSE DEL GUAVIARE', 27, 1), ('MITU', 28, 1), ('PUERTO CARREÑO', 29, 1), ('SAN ANDRES', 30, 1);

SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'talentohumano360' AND TABLE_NAME = 'MASTER_OFFICES';


-- cambio de flujo master_leader - users.



-- Insertamos los líderes en la tabla USERS. 
ALTER TABLE MASTER_LEADER 
ADD COLUMN user_id INT AFTER leader_id;
-- Desactivar el modo seguro
SET SQL_SAFE_UPDATES = 0;

-- Ejecuta tu UPDATE
UPDATE MASTER_LEADER ml 
JOIN USERS u ON ml.name = CONCAT(u.name, ' ', u.last_name) 
SET ml.user_id = u.user_id;

-- (Opcional) Volver a activarlo por seguridad
-- SET SQL_SAFE_UPDATES = 1;

-- Insertar los líderes como usuarios
-- Nota: Usamos un email generado a partir del nombre y una clave genérica



SET FOREIGN_KEY_CHECKS = 0;

-- SET FOREIGN_KEY_CHECKS = 1;

-- D. Eliminamos la columna name de MASTER_LEADER
-- A partir de ahora, el nombre se consulta haciendo JOIN con USERS
ALTER TABLE MASTER_LEADER 
DROP COLUMN name;

-- Borrar todos los registros de la tabla de líderes
TRUNCATE TABLE MASTER_LEADER;

-- 1. Crear tabla de Cargos (Master Job Titles)
CREATE TABLE MASTER_JOB_TITLES (
    id_job INT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT
);

-- 2. Crear tabla de Órdenes de Contratación (Hiring Order)
CREATE TABLE HIRING_ORDER (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    id_job INT,
    user_id INT,
    detail_justification VARCHAR(255),
    polygraph_test TINYINT(1),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by VARCHAR(100),
    probation_end_date DATETIME,
    hire_date DATETIME,
    probation_days TINYINT(1), -- Según tu imagen es TINYINT
    uploaded_by VARCHAR(100),
    cost_center_id INT,
    plant_id INT,
    office_id INT,
    contract_id INT NOT NULL,
    city_id INT,
    client_id INT,
    status_id INT,
    selection_confirmed VARCHAR(100),
    selection_hiring_confirmed VARCHAR(100),
    leader_id INT
);

-- Maestra de Géneros
CREATE TABLE MASTER_TYPE_GENDER (
    gender_id INT AUTO_INCREMENT PRIMARY KEY,
    type_gender VARCHAR(50) UNIQUE NOT NULL,
    status_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Tipos de Documento (Cédula, Pasaporte, etc.)
CREATE TABLE MASTER_TYPE_DOCUMENT (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_document VARCHAR(100) UNIQUE NOT NULL,
    status_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Principal de Personas
CREATE TABLE PEOPLE (
    people_id INT AUTO_INCREMENT PRIMARY KEY,
    type_id INT, -- FK hacia MASTER_TYPE_DOCUMENT
    document_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    birthdate DATE,
    phone_number VARCHAR(20),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    gender_id INT, -- FK hacia MASTER_TYPE_GENDER
    details_id INT,
    housing_city_id INT,
    city_births_id INT,
    people_business_id INT,
    departament_id INT
);

-- Tabla de Expediente Documental
CREATE TABLE DOCUMENT_EXPEDIENT (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    document_name VARCHAR(150),
    order_id INT,
    type_file INT,
    upload_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    attachments MEDIUMBLOB, -- Para archivos pesados
    attachments_verified TINYINT(1) DEFAULT 0,
    document_checks TINYINT(1) DEFAULT 0,
    file_size BIGINT,
    file_extension VARCHAR(10)
);

-- Tabla Puente: Relación entre Órdenes y Personas
CREATE TABLE ORDER_PEOPLE (
    id_order_people INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    people_id INT
);

-- Conectar PEOPLE con sus maestros de tipo de documento y género
ALTER TABLE PEOPLE 
ADD CONSTRAINT fk_people_type_doc FOREIGN KEY (type_id) REFERENCES MASTER_TYPE_DOCUMENT(type_id),
ADD CONSTRAINT fk_people_gender FOREIGN KEY (gender_id) REFERENCES MASTER_TYPE_GENDER(gender_id);

-- Conectar ORDER_PEOPLE con la tabla de personas
ALTER TABLE ORDER_PEOPLE 
ADD CONSTRAINT fk_order_people_entity FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id);

-- Conectar ORDER_PEOPLE con HIRING_ORDER (que creamos en el bloque anterior)
ALTER TABLE ORDER_PEOPLE 
ADD CONSTRAINT fk_order_people_order FOREIGN KEY (order_id) REFERENCES HIRING_ORDER(order_id);

-- Conectar DOCUMENT_EXPEDIENT con HIRING_ORDER
ALTER TABLE DOCUMENT_EXPEDIENT 
ADD CONSTRAINT fk_doc_order FOREIGN KEY (order_id) REFERENCES HIRING_ORDER(order_id);


-- Maestra de Contratos (Tipos de contrato: Término fijo, indefinido, etc.)
CREATE TABLE MASTER_CONTRACTS (
    contract_id INT AUTO_INCREMENT PRIMARY KEY,
    type_contract VARCHAR(100),
    name_contract VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT -- FK hacia STATUS_MASTER
);

-- Maestra de Clientes (Empresas a las que se les presta el servicio)
CREATE TABLE MASTER_CLIENT (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    NIT VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT -- FK hacia STATUS_MASTER
);

-- Conectar MASTER_CONTRACTS con estados
ALTER TABLE MASTER_CONTRACTS 
ADD CONSTRAINT fk_contract_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);

-- Conectar MASTER_CLIENT con estados
ALTER TABLE MASTER_CLIENT 
ADD CONSTRAINT fk_client_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);

-- CONEXIÓN HACIA HIRING_ORDER (La tabla del primer bloque)
-- Ahora que ya existen estas maestras, vinculamos la orden de contratación
ALTER TABLE HIRING_ORDER 
ADD CONSTRAINT fk_hiring_contract FOREIGN KEY (contract_id) REFERENCES MASTER_CONTRACTS(contract_id),
ADD CONSTRAINT fk_hiring_client FOREIGN KEY (client_id) REFERENCES MASTER_CLIENT(client_id);


-- Maestras de caracterización
CREATE TABLE MASTER_SEXUAL_ORIENTATION (
    orientation_id INT AUTO_INCREMENT PRIMARY KEY,
    type_orientation VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_SPECIAL_POPULATION (
    special_population_id INT AUTO_INCREMENT PRIMARY KEY,
    type_special VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_ETHNIC_GROUP (
    ethnic_id INT AUTO_INCREMENT PRIMARY KEY,
    type_ethnic VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_TYPE_BLOOD (
    blood_id INT AUTO_INCREMENT PRIMARY KEY,
    type_blood VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_TYPE_HOUSING (
    housing_id INT AUTO_INCREMENT PRIMARY KEY,
    type_housing VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_TYPE_VEHICLE (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    type_vehicle VARCHAR(50) UNIQUE NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MASTER_STATUS_ENDOWMENT (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_endowment VARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Central de Detalles
CREATE TABLE PEOPLE_DETAILS (
    details_id INT AUTO_INCREMENT PRIMARY KEY,
    orientation_id INT,
    special_population_id INT,
    ethnic_id INT,
    stratum TINYINT,
    partner_name VARCHAR(50),
    neighborhood VARCHAR(50),
    address VARCHAR(100),
    children_count INT,
    partner_id_number VARCHAR(20),
    size_shirt VARCHAR(5),
    size_jean VARCHAR(5),
    size_shoes VARCHAR(5),
    size_jacket VARCHAR(5),
    status_endowment INT,
    size_vest VARCHAR(5),
    blood_id INT,
    housing_id INT,
    vehicle_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE PEOPLE_DETAILS 
ADD CONSTRAINT fk_det_orientation FOREIGN KEY (orientation_id) REFERENCES MASTER_SEXUAL_ORIENTATION(orientation_id),
ADD CONSTRAINT fk_det_special FOREIGN KEY (special_population_id) REFERENCES MASTER_SPECIAL_POPULATION(special_population_id),
ADD CONSTRAINT fk_det_ethnic FOREIGN KEY (ethnic_id) REFERENCES MASTER_ETHNIC_GROUP(ethnic_id),
ADD CONSTRAINT fk_det_blood FOREIGN KEY (blood_id) REFERENCES MASTER_TYPE_BLOOD(blood_id),
ADD CONSTRAINT fk_det_housing FOREIGN KEY (housing_id) REFERENCES MASTER_TYPE_HOUSING(housing_id),
ADD CONSTRAINT fk_det_vehicle FOREIGN KEY (vehicle_id) REFERENCES MASTER_TYPE_VEHICLE(vehicle_id),
ADD CONSTRAINT fk_det_endowment FOREIGN KEY (status_endowment) REFERENCES MASTER_STATUS_ENDOWMENT(status_id);

-- AHORA SÍ: Conectamos PEOPLE con esta tabla de detalles que dejamos pendiente antes
ALTER TABLE PEOPLE 
ADD CONSTRAINT fk_people_details FOREIGN KEY (details_id) REFERENCES PEOPLE_DETAILS(details_id);


-- Maestra de Nivel Educativo (Bachiller, Técnico, Profesional, etc.)
CREATE TABLE MASTER_LEVEL_EDUCATION (
    level_education_id INT AUTO_INCREMENT PRIMARY KEY,
    type_education VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Títulos Obtenidos
CREATE TABLE MASTER_TITLE_EDUCATION (
    title_education_id INT AUTO_INCREMENT PRIMARY KEY,
    title_education VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Información Extendida del Personal
CREATE TABLE PEOPLE_EXTENDED_INFO (
    extended_info_id INT AUTO_INCREMENT PRIMARY KEY,
    people_id INT UNIQUE NOT NULL, -- Relación 1:1 con PEOPLE
    ref_int_metadata VARCHAR(50),
    pep_metadata VARCHAR(255),
    name_emergency VARCHAR(150),
    number_phone_emergency VARCHAR(20),
    contact_relationship VARCHAR(100),
    name_relationship VARCHAR(50),
    level_education_id INT,
    title_education_id INT,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conectar con la tabla de personas (PEOPLE)
ALTER TABLE PEOPLE_EXTENDED_INFO 
ADD CONSTRAINT fk_ext_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id);

-- Conectar con las maestras de educación
ALTER TABLE PEOPLE_EXTENDED_INFO 
ADD CONSTRAINT fk_ext_level FOREIGN KEY (level_education_id) REFERENCES MASTER_LEVEL_EDUCATION(level_education_id),
ADD CONSTRAINT fk_ext_title FOREIGN KEY (title_education_id) REFERENCES MASTER_TITLE_EDUCATION(title_education_id);


-- Maestra de EPS
CREATE TABLE MASTER_EPS (
    eps_id INT AUTO_INCREMENT PRIMARY KEY,
    name_eps VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Fondos de Pensión
CREATE TABLE MASTER_PENSION (
    pension_id INT AUTO_INCREMENT PRIMARY KEY,
    name_fund VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Cajas de Compensación
CREATE TABLE MASTER_COMPENSATION_BOX (
    compesation_box_id INT AUTO_INCREMENT PRIMARY KEY,
    name_compesation_box VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Condiciones Médicas
CREATE TABLE MASTER_MEDICAL (
    medical_condition_id INT AUTO_INCREMENT PRIMARY KEY,
    type_medical_condition VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_id INT
);

-- Maestra de ARL
CREATE TABLE MASTER_ARL (
    arl_id INT AUTO_INCREMENT PRIMARY KEY,
    name_arl VARCHAR(100) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Central de Salud y Seguridad
CREATE TABLE PEOPLE_HEALT_SECURITY (
    healt_security_id INT AUTO_INCREMENT PRIMARY KEY,
    people_id INT UNIQUE, -- Relación 1:1 con PEOPLE
    eps_id INT,
    pension_id INT,
    compensation_box_id INT,
    medical_conditions_id INT,
    bank_account VARCHAR(20),
    other_medical_conditions TEXT,
    data_processing_authorization TINYINT(1),
    compensation_family_box INT, -- FK hacia la misma caja o bandera
    housing_allawance TINYINT(1),
    arl_id INT
);

-- Conectar con la tabla de personas (PEOPLE)
ALTER TABLE PEOPLE_HEALT_SECURITY 
ADD CONSTRAINT fk_healt_people FOREIGN KEY (people_id) REFERENCES PEOPLE(people_id);

-- Conectar con las maestras de seguridad social
ALTER TABLE PEOPLE_HEALT_SECURITY 
ADD CONSTRAINT fk_healt_eps FOREIGN KEY (eps_id) REFERENCES MASTER_EPS(eps_id),
ADD CONSTRAINT fk_healt_pension FOREIGN KEY (pension_id) REFERENCES MASTER_PENSION(pension_id),
ADD CONSTRAINT fk_healt_box FOREIGN KEY (compensation_box_id) REFERENCES MASTER_COMPENSATION_BOX(compesation_box_id),
ADD CONSTRAINT fk_healt_medical FOREIGN KEY (medical_conditions_id) REFERENCES MASTER_MEDICAL(medical_condition_id),
ADD CONSTRAINT fk_healt_arl FOREIGN KEY (arl_id) REFERENCES MASTER_ARL(arl_id);

-- Conectar las maestras con STATUS_MASTER (que ya existe)
ALTER TABLE MASTER_EPS ADD CONSTRAINT fk_eps_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_PENSION ADD CONSTRAINT fk_pension_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_COMPENSATION_BOX ADD CONSTRAINT fk_box_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_MEDICAL ADD CONSTRAINT fk_medical_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);
ALTER TABLE MASTER_ARL ADD CONSTRAINT fk_arl_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);


-- Maestra de Empresas (Compañías internas o externas)
CREATE TABLE MASTER_COMPANY (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Áreas (Recursos Humanos, Contabilidad, etc.)
CREATE TABLE MASTER_AREA (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maestra de Tipos de Personas (Empleado, Contratista, Pasante, etc.)
CREATE TABLE MASTER_TYPE_PEOPLE (
    type_people_id INT AUTO_INCREMENT PRIMARY KEY,
    type_people VARCHAR(50) NOT NULL,
    status_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Central de Datos Empresariales del Personal
CREATE TABLE BUSINESS_PEOPLE_DATA (
    people_business_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    city_work_id INT,
    contract_id INT,
    leader_id INT,
    notes VARCHAR(200),
    missing_vacancy VARCHAR(50),
    job_title INT, -- Referencia a MASTER_JOB_TITLES
    salary DECIMAL(15,2),
    termination_date DATETIME,
    start_date DATETIME,
    end_state DATETIME,
    status_id INT,
    order_id INT,
    cost_center_id INT,
    unit_id INT,
    type_people_id INT,
    company_id INT,
    area_id INT
);

-- Conectar BUSINESS_PEOPLE_DATA con sus nuevas maestras
ALTER TABLE BUSINESS_PEOPLE_DATA 
ADD CONSTRAINT fk_bus_company FOREIGN KEY (company_id) REFERENCES MASTER_COMPANY(company_id),
ADD CONSTRAINT fk_bus_area FOREIGN KEY (area_id) REFERENCES MASTER_AREA(area_id),
ADD CONSTRAINT fk_bus_type_p FOREIGN KEY (type_people_id) REFERENCES MASTER_TYPE_PEOPLE(type_people_id);

-- Conectar con tablas creadas en bloques anteriores
ALTER TABLE BUSINESS_PEOPLE_DATA 
ADD CONSTRAINT fk_bus_client FOREIGN KEY (client_id) REFERENCES MASTER_CLIENT(client_id),
ADD CONSTRAINT fk_bus_contract FOREIGN KEY (contract_id) REFERENCES MASTER_CONTRACTS(contract_id),
ADD CONSTRAINT fk_bus_job FOREIGN KEY (job_title) REFERENCES MASTER_JOB_TITLES(id_job),
ADD CONSTRAINT fk_bus_order FOREIGN KEY (order_id) REFERENCES HIRING_ORDER(order_id),
ADD CONSTRAINT fk_bus_status FOREIGN KEY (status_id) REFERENCES STATUS_MASTER(status_id);

-- ¡CONEXIÓN CLAVE! Cerramos el pendiente en la tabla PEOPLE
ALTER TABLE PEOPLE 
ADD CONSTRAINT fk_people_business FOREIGN KEY (people_business_id) REFERENCES BUSINESS_PEOPLE_DATA(people_business_id);


-- Tabla de Plantas de Operación
CREATE TABLE OPERATION_PLANT (
    plant_id INT AUTO_INCREMENT PRIMARY KEY,
    cost_center_id INT -- FK hacia COST_CENTER
);
-- Conectar OPERATION_PLANT con COST_CENTER (que creamos al inicio del proyecto)
ALTER TABLE OPERATION_PLANT 
ADD CONSTRAINT fk_plant_cost_center FOREIGN KEY (cost_center_id) REFERENCES COST_CENTER(cost_center_id);

-- CONEXIÓN CLAVE: Cerramos el pendiente en HIRING_ORDER
ALTER TABLE HIRING_ORDER 
ADD CONSTRAINT fk_hiring_plant FOREIGN KEY (plant_id) REFERENCES OPERATION_PLANT(plant_id);


SELECT * FROM ROLE_pages;

-- Limpiamos registros previos para evitar conflictos de IDs si es necesario
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ROLES;
SET FOREIGN_KEY_CHECKS = 1;

-- Agregamos el campo para el cambio de contraseña obligatorio
ALTER TABLE USERS 
ADD COLUMN requires_password_change TINYINT(1) DEFAULT 1;

-- Agregamos el número de documento como identificador único de login
-- Lo posicionamos después del user_id para mantener el orden lógico
ALTER TABLE USERS 
ADD COLUMN document_number VARCHAR(20) UNIQUE AFTER user_id;

DESCRIBE USERS;



-- Primero borramos cualquier intento fallido previo para que no haya conflicto de documento
DELETE FROM USERS WHERE document_number = '12345678';

INSERT INTO ROLES (role_id, name_role, description, status_rol) VALUES
(1, 'Gerente', 'Alto Mando: Gestión administrativa y estratégica', 1),
(2, 'Tecnologia', 'Alto Mando: Administración de sistemas y seguridad', 1),
(3, 'Lideres', 'Medio Mando: Gestión de equipos y centros de costos', 1),
(4, 'Soporte', 'Medio Mando: Soporte técnico y gestión de usuarios', 1),
(5, 'Analista', 'Bajo Mando: Operación y análisis de datos', 1);


-- Insertamos el usuario con los nombres de columna exactos de tu DESCRIBE
INSERT INTO USERS (
    document_number, 
    role_id, 
    email, 
    password_hash, 
    name, 
    last_name, 
    status_id, 
    requires_password_change
) VALUES (
    '8275419', 
    1, -- Rol Gerente (según el script de roles que cargamos)
    'soporte@talentohumano364.com', 
    '$2a$12$D3QttM3wN00F8kEwSS9fxeseXuFI0wzkSbarW91ouwXvt/ZfjaCt6', -- El backend luego se encargará de validar esto o hashearlo
    'Admin', 
    'Gerente', 
    1, 
    1
);



-- Limpiamos por si acaso quedó algún registro a medias
-- TRUNCATE TABLE PAGES;

-- Insertamos las páginas con los nombres de columna correctos
INSERT INTO PAGES (page_name, route, description, status_page, page_route) VALUES
('Dashboard', '/dashboard', 'Panel principal de indicadores', 1, '/dashboard'),
('Gestión de Roles', '/roles', 'Administración de jerarquías', 1, '/roles'),
('Gestión de Permisos', '/permissions', 'Asignación de accesos por página', 1, '/permissions'),
('Gestión de Usuarios', '/users', 'Administración de personal y cuentas', 1, '/users'),
('Planta Operación', '/planta', 'Control de personal operativo', 1, '/planta'),
('Centro de Costos', '/costos', 'Gestión financiera por áreas', 1, '/costos'),
('Carga Excel', '/upload', 'Importación masiva de datos', 1, '/upload'),
('Orden de Contratación', '/contratacion', 'Generación de documentos legales', 1, '/contratacion');

-- Le damos al Gerente (ID 1) permiso para ver todas las páginas recién creadas
INSERT INTO ROLE_PAGES (role_id, page_id)
SELECT 1, page_id FROM PAGES;

SELECT * FROM PAGES;
DESCRIBE PAGES;


-- PASO A: Crear la columna que el Backend necesita para el JOIN
ALTER TABLE PAGES ADD COLUMN page_code VARCHAR(50) AFTER page_id;


-- Si esto falla con "Duplicate column", no importa, significa que ya está.
ALTER TABLE role_pages ADD COLUMN page_code VARCHAR(50) NOT NULL;

SET SQL_SAFE_UPDATES = 0;

-- Llenamos los códigos en la tabla maestra
UPDATE PAGES SET page_code = 'DASHBOARD' WHERE route = '/dashboard';
UPDATE PAGES SET page_code = 'ROLES' WHERE route = '/roles';
UPDATE PAGES SET page_code = 'PERMISSIONS' WHERE route = '/permissions';
UPDATE PAGES SET page_code = 'USERS' WHERE route = '/users';
UPDATE PAGES SET page_code = 'PLANTA' WHERE route = '/planta';
UPDATE PAGES SET page_code = 'COSTOS' WHERE route = '/costos';
UPDATE PAGES SET page_code = 'UPLOAD' WHERE route = '/upload';
UPDATE PAGES SET page_code = 'CONTRATACION' WHERE route = '/contratacion';

-- Limpiamos la tabla de relación para evitar basura
TRUNCATE TABLE role_pages;
SELECT * FROM role_pages;


-- (Si ya existe, te dará error de duplicado, ignóralo y sigue)
ALTER TABLE role_pages ADD COLUMN can_view TINYINT(1) DEFAULT 1;
ALTER TABLE role_pages ADD COLUMN can_edit TINYINT(1) DEFAULT 1;
ALTER TABLE role_pages MODIFY COLUMN page_code VARCHAR(50) NOT NULL;


-- Insertamos la relación final
INSERT INTO role_pages (role_id, page_code, can_view, can_edit) 
SELECT 1, page_code, 1, 1 FROM PAGES;

-- Limpiamos para evitar conflictos
-- TRUNCATE TABLE role_pages;

-- Insertamos los permisos: El Rol 1 (Gerente) tiene permiso 1 (Sí) en cada página
INSERT INTO role_pages (role_id, page_code, can_view, can_edit) 
SELECT 1, page_code, 1, 1 FROM PAGES;

-- DESCRIBE permissions;


-- 1. Creamos la columna que el backend está buscando
ALTER TABLE permissions ADD COLUMN permission_code VARCHAR(100) AFTER permission_id;

-- 2. Llenamos la columna permission_code usando la descripción o valores genéricos
-- Esto es para que el código tenga un 'código' de texto que leer
SET SQL_SAFE_UPDATES = 0;
UPDATE permissions SET permission_code = UPPER(REPLACE(description, ' ', '_'));

-- 3. Si tienes un permiso general, asegúrate de que sea potente
UPDATE permissions SET permission_code = 'ACCESS_ALL' WHERE permission_id = 1;

-- 1. Aseguramos que la tabla de unión también tenga la columna permission_code
-- (Si ya existe, te dará error de duplicado, ignóralo)
ALTER TABLE role_permissions ADD COLUMN permission_code VARCHAR(100);

-- 2. Limpiamos y asignamos todos los permisos al Gerente (role_id = 1)
TRUNCATE TABLE role_permissions;

INSERT INTO role_permissions (role_id, permission_code)
SELECT 1, permission_code FROM permissions;

SELECT * FROM ROLE_PERMISSIONS;



-- 1. Aseguramos que la tabla tenga los nombres que Copilot ve en el código
-- ALTER TABLE role_permissions CHANGE COLUMN role_code role_id INT; -- Si se llamaba role_code
-- ALTER TABLE role_permissions MODIFY COLUMN permission_code VARCHAR(100);

-- 2. Población definitiva para el Gerente
INSERT INTO role_permissions (role_id, permission_code)
SELECT 1, permission_code FROM permissions
ON DUPLICATE KEY UPDATE permission_code = VALUES(permission_code);

SELECT * FROM USERS;

INSERT INTO USERS (name, last_name, email, password_hash, role_id, status_id) VALUES 
('DAYRON', 'DE JESUS GAMERO PEÑA', 'dayron.gamero@talento.com', '$2b$10$DefaultHash123', 3, 1),
('RAFAEL', 'DAVID ROYS PACHECO', 'rafael.roys@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LEDYS', 'MARIA OTALVARO BEDOYA', 'ledys.otalvaro@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LINA', 'MARIA CORTES GOMEZ', 'lina.cortes@talento.com', '$2b$10$DefaultHash123', 3, 1),
('DIEGO', 'FERNANDO RODRIGUEZ GUERRERO', 'diego.rodriguez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LUZ', 'ADRIANA RIOS PARRA', 'luz.rios@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MARISOL', 'CAMARGO CARVAJAL', 'marisol.camargo@talento.com', '$2b$10$DefaultHash123', 3, 1),
('IRMA', 'LUCIA HERNANDEZ FLOREZ', 'irma.hernandez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('JHON', 'WALTHER RAIGOZA GONZALEZ', 'jhon.raigoza@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MARIA', 'CRISTINA FIGUEROA GUZMAN', 'maria.figueroa@talento.com', '$2b$10$DefaultHash123', 3, 1),
('VICTOR', 'ALVAREZ HERNANDEZ', 'victor.alvarez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('KELLY', 'ALEXANDRA BENITEZ TORRES', 'kelly.benitez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('ROCIO', 'BLANDON AREVALO', 'rocio.blandon@talento.com', '$2b$10$DefaultHash123', 3, 1),
('KELLY', 'YOHANA CASTRILLON FLOREZ', 'kelly.castrillon@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LAURA', 'MARCELA MONTOYA PIEDRAHITA', 'laura.montoya@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MONICA', 'LILIANA ORTEGA JOJOA', 'monica.ortega@talento.com', '$2b$10$DefaultHash123', 3, 1),
('KAREN', 'ASTRID PINZON CASTAÑEDA', 'karen.pinzon@talento.com', '$2b$10$DefaultHash123', 3, 1),
('DARIO', 'ALEXANDER AGUIRRE TRUJILLO', 'dario.aguirre@talento.com', '$2b$10$DefaultHash123', 3, 1),
('OSCAR', 'ALEJANDRO NIETO FULA', 'oscar.nieto@talento.com', '$2b$10$DefaultHash123', 3, 1),
('DAVID', 'HENRIQUE BLANCO PALMA', 'david.blanco@talento.com', '$2b$10$DefaultHash123', 3, 1),
('ESPERANZA', 'TRUJILLO RINCON', 'esperanza.trujillo@talento.com', '$2b$10$DefaultHash123', 3, 1),
('NATHALY', 'GONZALEZ CAMACHO', 'nathaly.gonzalez@talento.com', '$2b$10$DefaultHash123',3, 1),
('JIMENA', 'ALEXANDRA RAMIREZ CARVAJAL', 'jimena.ramirez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LEIDY', 'VANESSA ESTEVEZ CONTRERAS', 'leidy.estevez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('FREDY', 'FERNANDO RIVEROS OSPINA', 'fredy.riveros@talento.com', '$2b$10$DefaultHash123', 3, 1),
('ANA', 'JUDITH GONZÁLEZ MAHECHA', 'ana.gonzalez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('KELLY', 'JOHANA CANO MAZO', 'kelly.cano@talento.com', '$2b$10$DefaultHash123', 3, 1),
('YAZMIN', 'RUEDA BOLIVAR', 'yazmin.rueda@talento.com', '$2b$10$DefaultHash123', 3, 1),
('JOHANNA', 'MILENA MORENO CARDOZO', 'johanna.moreno@talento.com', '$2b$10$DefaultHash123', 3, 1),
('GLORIA', 'VANESSA RODRIGUEZ MUÑOZ', 'gloria.rodriguez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('CLAUDIA', 'PATRICIA ACOSTA ROMERO', 'claudia.acosta@talento.com', '$2b$10$DefaultHash123', 3, 1),
('SANDRA', 'XIMENA LATORRE NOGUERA', 'sandra.latorre@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LUIS', 'CARLOS PEÑARANDA BARRIENTOS', 'luis.peñaranda@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MARIA', 'FERNANDA RAMIREZ PALACIOS', 'maria.ramirez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('CINDY', 'PAOLA SUAREZ SANABRIA', 'cindy.suarez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('SANDRA', 'PATRICIA ALARCON SEGURA', 'sandra.alarcon@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MARYOIRY', 'LILIANA AVILA RUBIO', 'maryoiry.avila@talento.com', '$2b$10$DefaultHash123', 3, 1),
('SANDRA', 'YAMILE HERNANDEZ CRISTANCHO', 'sandra.hernandez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('SEBASTIAN', 'ARISMENDY MESA', 'sebastian.arismendy@talento.com', '$2b$10$DefaultHash123', 3, 1),
('WILLIAM', 'GARCES CASTRO', 'william.garces@talento.com', '$2b$10$DefaultHash123', 3, 1),
('EVELYN', 'SUAZA MONTOYA', 'evelyn.suaza@talento.com', '$2b$10$DefaultHash123', 3, 1),
('ELBA', 'LUCIA ESTEVEZ CONTRERAS', 'elba.estevez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('NORMA', 'LUCIA RANGEL ESTEVEZ', 'norma.rangel@talento.com', '$2b$10$DefaultHash123', 3, 1),
('NUBIA', 'ESPERANZA PARRADO CARDENAS', 'nubia.parrado@talento.com', '$2b$10$DefaultHash123', 3, 1),
('JONH', 'ALEXANDER HORTUA BARRETO', 'jonh.hortua@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LUZ', 'ANGELA BULLA SILVA', 'luz.bulla@talento.com', '$2b$10$DefaultHash123', 3, 1),
('CRISTHIAN', 'ALFONSO CARDONA ARIAS', 'cristian.cardona@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MARITZA', 'TATIANA TOLOZA MOJICA', 'maritza.toloza@talento.com', '$2b$10$DefaultHash123', 3, 1),
('JHON', 'FREDY SUAREZ ZARATE', 'jhon.suarez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('WILLIAM', 'OSVALDO ORTIZ HERRERA', 'william.ortiz@talento.com', '$2b$10$DefaultHash123', 3, 1),
('YERSY', 'RICARDO IBARRA GARRETA', 'yersy.ibarra@talento.com', '$2b$10$DefaultHash123', 3, 1),
('HENRY', 'GIRALDO JARAMILLO', 'henry.giraldo@talento.com', '$2b$10$DefaultHash123', 3, 1),
('ANNY', 'ALEXANDRA SIERRA CARDENAS', 'anny.sierra@talento.com', '$2b$10$DefaultHash123', 3, 1),
('GISELA', 'SUAZA MONTOYA', 'gisela.suaza@talento.com', '$2b$10$DefaultHash123', 3, 1),
('MEIBY', 'JULIETH CAMACHO', 'meiby.camacho@talento.com', '$2b$10$DefaultHash123', 3, 1),
('JENNIFER', 'ANGELICA ORJUELA PARRA', 'jennifer.orjuela@talento.com', '$2b$10$DefaultHash123', 3, 1),
('ERIKA', 'STEFFANIA MELO GUTIERREZ', 'erika.melo@talento.com', '$2b$10$DefaultHash123', 3, 1),
('LUIS', 'FELIPE LOPEZ RUIZ', 'luis.lopez@talento.com', '$2b$10$DefaultHash123', 3, 1),
('JEISON', 'MAURICIO ZAPATA ALONSO', 'jeison.zapata@talento.com', '$2b$10$DefaultHash123', 3, 1);

INSERT INTO MASTER_LEADER (user_id, status_id)
SELECT user_id, 1 
FROM USERS 
WHERE role_id = 3; -- Cambia el 1 por el ID que corresponda al rol de líder

SELECT * FROM ROLES;
SELECT * FROM MASTER_LEADER;
SELECT * FROM USERS;
SELECT * FROM MASTER_OFFICE;

SELECT * FROM MASTER_AREA;

INSERT INTO master_area (name, status_id) VALUES 
('ZONA BOGOTA', 1),
('ADMINISTRACION', 1),
('CESAR Y GUAJIRA', 1),
('ANTIOQUIA SUR', 1),
('HUILA Y SUR', 1),
('SUR', 1),
('ANTIOQUIA NORTE', 1),
('CUNDIBOYACENSE', 1),
('SANTANDERES', 1),
('SINU Y SABANAS', 1),
('TOLIMA', 1),
('EJE CAFETERO NORTE', 1),
('LLANOS', 1),
('CARIBE BOLIVAR', 1),
('NORTE', 1),
('VALLE CENTRO NORTE', 1),
('EJE CAFETERO SUR', 1),
('CAUCA Y NARIÑO', 1),
('BUCARAMANGA', 1),
('VALLE SUR', 1),
('CHAPINERO', 1),
('ZONA CENTRO', 1),
('CARIBE ATLANTICO', 1),
('METROPOLITANA', 1),
('CENTRO', 1),
('CALI', 1),
('ZONA OCCIDENTE', 1),
('BUCARAMANGA METROPOLITANA', 1),
('OCCIDENTE', 1),
('NOROCCIDENTE', 1),
('ZONA NORTE', 1),
('ZONA MEDELLIN', 1),
('CENTRO ORIENTE', 1),
('MEDELLIN SUR', 1),
('SIERRA NEVADA', 1),
('PALMIRA Y SUR', 1),
('GESTORIA ANTIOQUIA Y SABANAS', 1),
('GESTORIA BOGOTA Y CENTRO', 1),
('ZONA ORIENTE', 1),
('EJE CAFETERO', 1),
('MOBILIARIO BOGOTA', 1),
('BOGOTA', 1),
('CARIBE', 1),
('PALMIRA', 1),
('ZONA ANTIOQUIA', 1),
('NARIÑO', 1),
('VALLE NORTE Y QUINDIO', 1),
('BOGOTA Y CENTRO', 1),
('VALLE SUR Y CAUCA', 1),
('BOGOTÁ Y CENTRO', 1),
('ZONA SUPERVISOR', 1),
('TROPAS ANTIOQUIA Y SABANAS', 1),
('TROPAS BOGOTA Y CENTRO', 1),
('TROPAS SUR', 1),
('TROPAS EJE CAFETERO', 1);


-- -------------------------------------------------------------------------------------------
-- 2. Crear tabla de Órdenes de Contratación (Hiring Order)
CREATE TABLE HIRING_ORDER (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    id_job INT,
    user_id INT,
    detail_justification VARCHAR(255),
    polygraph_test TINYINT(1),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by VARCHAR(100),
    probation_end_date DATETIME,
    hire_date DATETIME,
    probation_days TINYINT(1), -- Según tu imagen es TINYINT
    uploaded_by VARCHAR(100),
    cost_center_id INT,
    plant_id INT,
    office_id INT,
    contract_id INT NOT NULL,
    city_id INT,
    client_id INT,
    status_id INT,
    selection_confirmed VARCHAR(100),
    selection_hiring_confirmed VARCHAR(100),
    leader_id INT
);










