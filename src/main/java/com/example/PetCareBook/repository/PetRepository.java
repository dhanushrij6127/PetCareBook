package com.example.PetCareBook.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.PetCareBook.entity.Pet;

public interface PetRepository extends JpaRepository<Pet, Long> {

}