package com.org.service;

import com.org.dto.request.TaskRequest;
import com.org.dto.response.TaskResponse;
import com.org.exception.BusinessRuleException;
import com.org.exception.DuplicateResourceException;
import com.org.exception.ResourceNotFoundException;
import com.org.mapper.TaskMapper;
import com.org.model.Developer;
import com.org.model.Task;
import com.org.model.enums.TaskStatus;
import com.org.repository.DeveloperRepository;
import com.org.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final DeveloperRepository developerRepository;
    private final TaskMapper taskMapper;

    private static final int MAX_ACTIVE_TASKS = 5;

    @Transactional
    public TaskResponse create(TaskRequest request) {
        validateTaskCreation(request.title(), request.developerId());

        Developer developer = developerRepository.findById(request.developerId())
                .orElseThrow(() -> new ResourceNotFoundException("Developer no encontrado"));

        Task task = taskMapper.toEntity(request, developer);
        // Aquí ya no se asigna status porque en tu flujo manual es siempre PENDING
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> findAll(Pageable pageable) {
        return taskRepository.findAll(pageable).map(taskMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(Long id) {
        // Regla 6: Validación de existencia
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        // Regla 6: Validación de existencia
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));

        // Regla 1: Título único
        if (!task.getTitle().equals(request.title()) && taskRepository.existsByTitle(request.title())) {
            throw new DuplicateResourceException("Ya existe una tarea con ese título");
        }

        // Regla 2: Solo actualizar tareas en estado PENDING
        if (task.getStatus() != TaskStatus.PENDING) {
            throw new BusinessRuleException("Solo se puede reasignar una tarea en estado PENDING");
        }

        // Regla 6: Validación de existencia del nuevo developer
        Developer newDeveloper = developerRepository.findById(request.developerId())
                .orElseThrow(() -> new ResourceNotFoundException("Developer no encontrado"));

        // Regla 3: Límite de tareas activas (si cambia de developer)
        if (!task.getDeveloper().getId().equals(newDeveloper.getId())) {
            int activeCount = taskRepository.countActiveTasksByDeveloperId(
                    newDeveloper.getId(), List.of(TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
            );

            if (activeCount >= MAX_ACTIVE_TASKS) {
                throw new BusinessRuleException("El nuevo developer tiene tareas activas al límite");
            }

            task.setDeveloper(newDeveloper);
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        // Regla 6: Validación de existencia
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse changeStatus(Long id, TaskStatus newStatus) {
        // Regla 6: Validación de existencia
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada"));

        TaskStatus current = task.getStatus();

        // Regla 4: Transición válida de estado
        if (newStatus == TaskStatus.COMPLETED && current != TaskStatus.IN_PROGRESS) {
            throw new BusinessRuleException("Solo se puede completar una tarea que estuvo en progreso");
        }

        if (newStatus == TaskStatus.IN_PROGRESS && current != TaskStatus.PENDING) {
            throw new BusinessRuleException("Solo se puede iniciar una tarea que esté pendiente");
        }

        task.setStatus(newStatus);
        return taskMapper.toResponse(taskRepository.save(task));
    }


    @Transactional(readOnly = true)
    public Page<TaskResponse> findByDateRange(LocalDate start, LocalDate end, Pageable pageable) {
        // Regla 7: Validar que la fecha de inicio no sea mayor que la fecha fin
        if (start.isAfter(end)) {
            throw new BusinessRuleException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        return taskRepository.findTasksByDateRange(start, end, pageable)
                .map(taskMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findActiveTasksByDeveloper(Long developerId) {
        // Regla 8: Consulta de tareas activas por developer
        List<Task> tasks = taskRepository.findTasksByDeveloperIdAndStatusIn(
                developerId, List.of(TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
        );
        return tasks.stream().map(taskMapper::toResponse).toList();
    }


    /*@Transactional
    public void importFromExcel(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                String title = row.getCell(0).getStringCellValue();
                String description = row.getCell(1).getStringCellValue();
                String statusStr = row.getCell(2).getStringCellValue();
                long developerId = (long) row.getCell(3).getNumericCellValue();
                String startDateStr = row.getCell(4).getStringCellValue();
                String endDateStr = row.getCell(5).getStringCellValue();

                TaskStatus status = TaskStatus.valueOf(statusStr.toUpperCase());

                LocalDate startDate = LocalDate.parse(startDateStr);
                LocalDate endDate = LocalDate.parse(endDateStr);

                validateTaskCreation(title, developerId);

                TaskRequest request = new TaskRequest(title, description, developerId, startDate, endDate);

                Developer developer = developerRepository.findById(developerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Developer no encontrado"));
                Task task = taskMapper.toEntity(request, developer);
                task.setStatus(status);

                taskRepository.save(task);
            }

        } catch (IOException | IllegalArgumentException e) {
            throw new RuntimeException("Error al importar Excel: " + e.getMessage(), e);
        }
    }*/

    @Transactional
    public void importFromExcel(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Saltar cabecera

                String description = row.getCell(0).getStringCellValue();
                String endDateStr = row.getCell(1).getStringCellValue();
                String startDateStr = row.getCell(2).getStringCellValue();
                String title = row.getCell(3).getStringCellValue();

                // Leer developer_id con tipo seguro
                Cell developerIdCell = row.getCell(4);
                long developerId;
                if (developerIdCell.getCellType() == CellType.NUMERIC) {
                    developerId = (long) developerIdCell.getNumericCellValue();
                } else {
                    developerId = Long.parseLong(developerIdCell.getStringCellValue());
                }

                LocalDate startDate = LocalDate.parse(startDateStr);
                LocalDate endDate = LocalDate.parse(endDateStr);

                validateTaskCreation(title, developerId);

                TaskRequest request = new TaskRequest(title, description, developerId, startDate, endDate);

                Developer developer = developerRepository.findById(developerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Developer no encontrado"));
                Task task = taskMapper.toEntity(request, developer);

                // Asignar estado por defecto
                task.setStatus(TaskStatus.PENDING);

                taskRepository.save(task);
            }

        } catch (IOException | IllegalArgumentException e) {
            throw new RuntimeException("Error al importar Excel: " + e.getMessage(), e);
        }
    }


    private void validateTaskCreation(String title, Long developerId) {
        if (taskRepository.existsByTitle(title)) {
            throw new DuplicateResourceException("Ya existe una tarea con ese título");
        }

        Developer developer = developerRepository.findById(developerId)
                .orElseThrow(() -> new ResourceNotFoundException("Developer no encontrado"));

        int activeCount = taskRepository.countActiveTasksByDeveloperId(
                developer.getId(), List.of(TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
        );

        if (activeCount >= MAX_ACTIVE_TASKS) {
            throw new BusinessRuleException("El developer ya tiene el número máximo de tareas activas");
        }
    }


}
