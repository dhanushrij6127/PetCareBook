
package com.example.PetCareBook.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.PetCareBook.entity.Pet;
import com.example.PetCareBook.entity.VaccinationRecord;

public interface VaccinationRecordRepository
        extends JpaRepository<VaccinationRecord, Long> {

    List<VaccinationRecord> findByPetIdOrderByDateGivenDesc(Long petId);

    @Query("""
            SELECT DISTINCT v.pet
            FROM VaccinationRecord v
            WHERE v.nextDueDate BETWEEN :startDate AND :endDate
            """)
    List<Pet> findPetsWithVaccinationsDueBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}