(function () {
    angular
        .module("NEURegistrar")
        .factory("ScheduleService", ScheduleService);

    function ScheduleService(ClassService, $http) {

        var api = {
            getScheduleDetail: getScheduleDetail,
            preprocessSchedule: preprocessSchedule,
            saveSchedule: saveSchedule,
            submitSchedule: submitSchedule,
            rejectSchedule: rejectSchedule,
            approveSchedule: approveSchedule
        };

        function getScheduleDetail(schedule, user) {
            if (user.admin) {
                var url = "/connection/adminGetSched.php?dept=" + schedule.departmentCode;
            } else {
                var url = "/connection/getScheduleByDept.php?dept=" + schedule.departmentCode;
            }
            return $http.get(url);
        }

        function preprocessSchedule(schedule) {

            // if no classes found for a given subject code, server currently returns a strange object in the
            // classes field -- it should just be an empty array, need to update this
            if (!(schedule.classes.constructor === Array)) {
                schedule.classes = [];
            }

            // misnamed column in database
            schedule.lastEditedBy = schedule.submitterName;
            delete schedule.submitterName;

            for (var x = 0; x < schedule.classes.length; x++) {
                var currentClass = schedule.classes[x];

                // server currently returns "0" or "1" for false and true (as strings)
                currentClass.includeClassRestriction = parseInt(currentClass.includeClassRestriction);
                currentClass.includeCollegeRestriction = parseInt(currentClass.includeCollegeRestriction);
                currentClass.includeLevelRestriction = parseInt(currentClass.includeLevelRestriction);
                currentClass.includeMajorRestriction = parseInt(currentClass.includeMajorRestriction);
                currentClass.includeProgramRestriction = parseInt(currentClass.includeProgramRestriction);
                currentClass.maxEnrollment = parseInt(currentClass.maxEnrollment);
                currentClass.priorEnrollment = parseInt(currentClass.priorEnrollment);
                currentClass.waitlistCapacity = parseInt(currentClass.waitlistCapacity);

                // marks all modified classes in a schedule as modified
                // currentClass.metadata = currentClass.metadata || {};
                // currentClass.metadata.modified = ClassService.isClassModified(currentClass);
                // currentClass.metadata.added = !currentClass.old;
                // currentClass.metadata.deleted = (currentClass.status === "C");

                // generate unique id for each class for angular routing
                currentClass.metadata = currentClass.metadata || {};
                currentClass.metadata.unique_id = ClassService.generateUniqueIdForClass(currentClass);

                if (!currentClass.old) {
                    currentClass.old = angular.copy(currentClass);
                }
            }
        }

        function saveSchedule(schedule) {
            // communicate with web service
        }

        function submitSchedule(schedule) {
            // communicate with web service
        }

        function rejectSchedule(schedule, rejectionMessage) {
            schedule.rejectionMessage = rejectionMessage;
            // communicate with web service
        }

        function approveSchedule(schedule) {
            // communicate with web service
        }

        return api;
    }
})();
