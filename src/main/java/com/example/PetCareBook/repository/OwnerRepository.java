package com.example.PetCareBook.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.PetCareBook.entity.Owner;

public interface OwnerRepository extends JpaRepository<Owner, Long> {

}
