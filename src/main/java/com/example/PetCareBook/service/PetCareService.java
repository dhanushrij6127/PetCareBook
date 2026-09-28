package com.example.PetCareBook.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.PetCareBook.entity.Owner;
import com.example.PetCareBook.entity.Pet;
import com.example.PetCareBook.entity.VaccineType;
import com.example.PetCareBook.entity.VaccinationRecord;
import com.example.PetCareBook.exception.InvalidVaccinationException;
import com.example.PetCareBook.repository.OwnerRepository;
import com.example.PetCareBook.repository.PetRepository;
import com.example.PetCareBook.repository.VaccineTypeRepository;
import com.example.PetCareBook.repository.VaccinationRecordRepository;

@Service
public class PetCareService {

    private final OwnerRepository ownerRepository;
    private final PetRepository petRepository;
    private final VaccineTypeRepository vaccineTypeRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;

    public PetCareService(
            OwnerRepository ownerRepository,
            PetRepository petRepository,
            VaccineTypeRepository vaccineTypeRepository,
            VaccinationRecordRepository vaccinationRecordRepository) {

        this.ownerRepository = ownerRepository;
        this.petRepository = petRepository;
        this.vaccineTypeRepository = vaccineTypeRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
    }

    // =========================
    // OWNER OPERATIONS
    // =========================

    public Owner addOwner(Owner owner) {
        return ownerRepository.save(owner);
    }

    public List<Owner> getAllOwners() {
        return ownerRepository.findAll();
    }

    public Owner getOwnerById(Long id) {
        return ownerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
    }

    public Owner updateOwner(Long id, Owner owner) {

        Owner existingOwner = getOwnerById(id);

        existingOwner.setName(owner.getName());
        existingOwner.setPhone(owner.getPhone());
        existingOwner.setEmail(owner.getEmail());

        return ownerRepository.save(existingOwner);
    }

    public void deleteOwner(Long id) {
        Owner owner = getOwnerById(id);
        ownerRepository.delete(owner);
    }

    // =========================
    // PET OPERATIONS
    // =========================

    public Pet addPet(Pet pet) {

    if (pet.getOwner() == null || pet.getOwner().getId() == null) {
        throw new RuntimeException("Owner ID is required");
    }

    Owner owner = getOwnerById(pet.getOwner().getId());
    pet.setOwner(owner);

    return petRepository.save(pet);
}
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    public Pet getPetById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
    }

    public Pet updatePet(Long id, Pet pet) {

        Pet existingPet = getPetById(id);

        existingPet.setName(pet.getName());
        existingPet.setSpecies(pet.getSpecies());
        existingPet.setBreed(pet.getBreed());
        existingPet.setDateOfBirth(pet.getDateOfBirth());

        return petRepository.save(existingPet);
    }

    public void deletePet(Long id) {
        Pet pet = getPetById(id);
        petRepository.delete(pet);
    }

    // =========================
    // VACCINE TYPE OPERATIONS
    // =========================

    public VaccineType addVaccineType(VaccineType vaccineType) {
        return vaccineTypeRepository.save(vaccineType);
    }

    public List<VaccineType> getAllVaccineTypes() {
        return vaccineTypeRepository.findAll();
    }

    public VaccineType getVaccineTypeById(Long id) {
        return vaccineTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccine type not found"));
    }

    public VaccineType updateVaccineType(Long id, VaccineType vaccineType) {

        VaccineType existingVaccine = getVaccineTypeById(id);

        existingVaccine.setName(vaccineType.getName());
        existingVaccine.setIntervalDays(vaccineType.getIntervalDays());

        return vaccineTypeRepository.save(existingVaccine);
    }

    public void deleteVaccineType(Long id) {
        VaccineType vaccineType = getVaccineTypeById(id);
        vaccineTypeRepository.delete(vaccineType);
    }

    // =========================
    // VACCINATION OPERATIONS
    // =========================

    public VaccinationRecord addVaccination(VaccinationRecord record) {

        // Rule 1: Vaccination date cannot be in the future

        if (record.getDateGiven().isAfter(LocalDate.now())) {
            throw new InvalidVaccinationException(
                    "Vaccination date cannot be in the future");
        }

        // Get actual pet from database

        Long petId = record.getPet().getId();

        Pet pet = getPetById(petId);

        record.setPet(pet);

        // Get actual vaccine type from database

        Long vaccineId = record.getVaccineType().getId();

        VaccineType vaccineType = getVaccineTypeById(vaccineId);

        record.setVaccineType(vaccineType);

        // Calculate next due date

        LocalDate nextDueDate = record.getDateGiven()
                .plusDays(vaccineType.getIntervalDays());

        record.setNextDueDate(nextDueDate);

        return vaccinationRecordRepository.save(record);
    }

    // Complete vaccination history of a pet

    public List<VaccinationRecord> getVaccinationHistory(Long petId) {

        getPetById(petId);

        return vaccinationRecordRepository
                .findByPetIdOrderByDateGivenDesc(petId);
    }

    // Vaccinations due within next 7 days

    public List<Pet> getPetsWithUpcomingVaccinations() {

        LocalDate today = LocalDate.now();
        LocalDate nextSevenDays = today.plusDays(7);

        return vaccinationRecordRepository
                .findPetsWithVaccinationsDueBetween(today, nextSevenDays);
    }
}