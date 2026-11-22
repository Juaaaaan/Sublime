import { describeMissingDeployedHost, ALLOWED_HOSTS_ENV_VAR, LOCAL_ALLOWED_HOSTS, resolveAllowedHosts } from './server-hosts';

describe('resolveAllowedHosts', () => {
  it('incluye los hosts locales cuando no hay variable de entorno', () => {
    expect(resolveAllowedHosts({})).toEqual([...LOCAL_ALLOWED_HOSTS]);
  });

  it('incluye los hosts locales cuando se llama sin argumentos', () => {
    expect(resolveAllowedHosts()).toEqual([...LOCAL_ALLOWED_HOSTS]);
  });

  it('conserva los hosts locales y añade los de la variable de entorno', () => {
    const hosts = resolveAllowedHosts({
      [ALLOWED_HOSTS_ENV_VAR]: 'sublime.example,www.sublime.example',
    });

    for (const local of LOCAL_ALLOWED_HOSTS) {
      expect(hosts).toContain(local);
    }
    expect(hosts).toContain('sublime.example');
    expect(hosts).toContain('www.sublime.example');
  });

  it('recorta los espacios alrededor de cada entrada', () => {
    const hosts = resolveAllowedHosts({
      [ALLOWED_HOSTS_ENV_VAR]: '  sublime.example , www.sublime.example  ',
    });

    expect(hosts).toContain('sublime.example');
    expect(hosts).toContain('www.sublime.example');
  });

  it('descarta las entradas vacías o solo con espacios', () => {
    expect(resolveAllowedHosts({ [ALLOWED_HOSTS_ENV_VAR]: 'a,,b' })).toEqual([
      ...LOCAL_ALLOWED_HOSTS,
      'a',
      'b',
    ]);
    expect(resolveAllowedHosts({ [ALLOWED_HOSTS_ENV_VAR]: 'a, ,b' })).toEqual([
      ...LOCAL_ALLOWED_HOSTS,
      'a',
      'b',
    ]);
  });

  it('trata una variable vacía como ausente', () => {
    expect(resolveAllowedHosts({ [ALLOWED_HOSTS_ENV_VAR]: '' })).toEqual([...LOCAL_ALLOWED_HOSTS]);
    expect(resolveAllowedHosts({ [ALLOWED_HOSTS_ENV_VAR]: undefined })).toEqual([
      ...LOCAL_ALLOWED_HOSTS,
    ]);
  });

  it('no duplica un host local repetido por la variable de entorno', () => {
    const hosts = resolveAllowedHosts({
      [ALLOWED_HOSTS_ENV_VAR]: 'localhost,sublime.example,localhost',
    });

    expect(hosts.filter((host) => host === 'localhost').length).toBe(1);
    expect(hosts.filter((host) => host === 'sublime.example').length).toBe(1);
  });

  it('nunca incluye el comodín que aceptaría cualquier host', () => {
    expect(resolveAllowedHosts({ [ALLOWED_HOSTS_ENV_VAR]: 'sublime.example' })).not.toContain('*');
  });
});

describe('describeMissingDeployedHost', () => {
  it('warns when only the local hosts are allowed', () => {
    const warning = describeMissingDeployedHost({});

    expect(warning).toContain(ALLOWED_HOSTS_ENV_VAR);
    expect(warning).toContain('400');
  });

  it('warns when the variable is present but empty', () => {
    expect(describeMissingDeployedHost({ [ALLOWED_HOSTS_ENV_VAR]: ' , ' })).not.toBeNull();
  });

  it('stays quiet once a deployed host is configured', () => {
    expect(describeMissingDeployedHost({ [ALLOWED_HOSTS_ENV_VAR]: 'sublime.example' })).toBeNull();
  });

  // Un host local repetido en la variable no cuenta como dominio desplegado: si contara,
  // el aviso callaria sin que haya ningun dominio publico en la lista.
  it('does not take a repeated local host for a deployed one', () => {
    expect(describeMissingDeployedHost({ [ALLOWED_HOSTS_ENV_VAR]: 'localhost' })).not.toBeNull();
  });
});
