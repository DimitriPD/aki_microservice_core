-- SQL Server Script for Microservice A - Personas

CREATE TABLE students (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    device_id VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE teachers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE classes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE class_students (
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE class_teachers (
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (class_id, teacher_id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    class_id INT NULL,
    teacher_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
