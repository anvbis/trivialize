#include <stdlib.h>
#include <node_api.h>
#include <napi-macros.h>

#include "libreprl.h"

struct reprl_context* global_reprl_context = NULL;

NAPI_METHOD(initialize_context)
{
  bool is_array;
  uint32_t len;

  NAPI_ARGV(2);

  NAPI_STATUS_THROWS(napi_is_array(env, argv[0], &is_array));
  if (!is_array) {
    napi_throw_error(env, "EINVAL", "Expected array");
  }
  napi_value argv_arr = argv[0];

  NAPI_STATUS_THROWS(napi_is_array(env, argv[1], &is_array));
  if (!is_array) {
    napi_throw_error(env, "EINVAL", "Expected array");
  }
  napi_value envp_arr = argv[1];

  napi_get_array_length(env, argv_arr, &len);
  const char** argv_raw = malloc(sizeof(const char*) * (len+1));

  NAPI_FOR_EACH(argv_arr, argv_elem) {
    NAPI_UTF8_MALLOC(out, argv_elem);
    argv_raw[i] = out;
  }
  argv_raw[len] = 0;

  napi_get_array_length(env, envp_arr, &len);
  const char** envp_raw = malloc(sizeof(const char*) * (len+1));

  NAPI_FOR_EACH(envp_arr, envp_elem) {
    NAPI_UTF8_MALLOC(out, envp_elem);
    envp_raw[i] = out;
  }
  envp_raw[len] = 0;

  global_reprl_context = reprl_create_context();
  int result = reprl_initialize_context(global_reprl_context, argv_raw, envp_raw, 1, 1);

  if (result < 0) {
    napi_throw_error(env, "EINVAL", reprl_get_last_error(global_reprl_context));
  }

  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(destroy_context)
{
  reprl_destroy_context(global_reprl_context);
  return napi_undefined;
}

NAPI_METHOD(execute)
{
  NAPI_ARGV(3);

  NAPI_ARGV_UTF8_MALLOC(script, 0);
  NAPI_ARGV_UINT32(timeout, 1);
  NAPI_ARGV_UINT32(fresh_instance, 2);

  uint64_t execution_time;
  int result = reprl_execute(global_reprl_context, script, script_len, (uint64_t)timeout,
    &execution_time, fresh_instance);

  if (result < 0) {
    napi_throw_error(env, "EINVAL", reprl_get_last_error(global_reprl_context));
  }

  free(script);
  NAPI_RETURN_INT32(result);
}

NAPI_METHOD(fetch_stdout)
{
  const char* stdout = reprl_fetch_stdout(global_reprl_context);
  NAPI_RETURN_STRING(stdout);
}

NAPI_METHOD(fetch_stderr)
{
  const char* stderr = reprl_fetch_stderr(global_reprl_context);
  NAPI_RETURN_STRING(stderr);
}

NAPI_METHOD(fetch_fuzzout)
{
  const char* fuzzout = reprl_fetch_fuzzout(global_reprl_context);
  NAPI_RETURN_STRING(fuzzout);
}

NAPI_METHOD(get_last_error)
{
  const char* last_error = reprl_get_last_error(global_reprl_context);
  NAPI_RETURN_STRING(last_error);
}

NAPI_INIT()
{
  NAPI_EXPORT_FUNCTION(initialize_context);
  NAPI_EXPORT_FUNCTION(destroy_context);
  
  NAPI_EXPORT_FUNCTION(execute);

  NAPI_EXPORT_FUNCTION(fetch_stdout);
  NAPI_EXPORT_FUNCTION(fetch_stderr);
  NAPI_EXPORT_FUNCTION(fetch_fuzzout);
  
  NAPI_EXPORT_FUNCTION(get_last_error);
}