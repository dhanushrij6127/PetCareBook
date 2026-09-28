package com.example.PetCareBook.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.PetCareBook.entity.VaccineType;

public interface VaccineTypeRepository extends JpaRepository<VaccineType, Long> {

}
